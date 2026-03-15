<#
.SYNOPSIS
Describe what this CLI does.

.DESCRIPTION
Copy this starter into a repository, rename it to match the command it provides, and
replace Invoke-RunCli with project-specific behavior.

.EXAMPLE
./powershell-cli.ps1

.EXAMPLE
./powershell-cli.ps1 -Debug

.EXAMPLE
$env:TANAAB_ITEM = 'a,b'
./powershell-cli.ps1 -Item c,d

Option precedence: explicit parameters override environment variables, which override defaults.

Run `./powershell-cli.ps1 -Help` for more advanced usage.
#>
param(
  [switch]$Force,
  [string[]]$Item,
  [switch]$Debug,
  [switch]$Help,
  [switch]$Version,

  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Positionals
)

Set-StrictMode -Version 3
$ErrorActionPreference = 'Stop'

$CLI_NAME = if ($PSCommandPath) { Split-Path -Leaf $PSCommandPath } else { $MyInvocation.MyCommand.Name }
# Keep a single top-level assignment so release automation can stamp the entrypoint in place.
$SCRIPT_VERSION = $null
$ESCAPE = [char]27
$USE_COLOR = $false

function Test-Truthy {
  param([AllowNull()][object]$Value)

  $normalized = ''
  if (-not [string]::IsNullOrWhiteSpace([string]$Value)) {
    $normalized = ([string]$Value).Trim().ToLowerInvariant()
  }

  switch ($normalized) {
    ''
    { return $false }
    '0'
    { return $false }
    'false'
    { return $false }
    'no'
    { return $false }
    'off'
    { return $false }
    default
    { return $true }
  }
}

function Get-FirstNonEmpty {
  param([string[]]$Values)

  foreach ($value in @($Values)) {
    if (-not [string]::IsNullOrWhiteSpace($value)) {
      return $value
    }
  }

  return ''
}

function Get-ScriptVersion {
  try {
    $output = & git describe --tags --always --abbrev=1 2>$null
    if ($LASTEXITCODE -ne 0) {
      return '0.0.0'
    }

    $resolved = ($output | Out-String).Trim()
    if ([string]::IsNullOrWhiteSpace($resolved)) {
      return '0.0.0'
    }

    return $resolved
  } catch {
    return '0.0.0'
  }
}

function Test-ColorEnabled {
  if (-not [string]::IsNullOrWhiteSpace($env:NO_COLOR)) {
    return $false
  }

  if (Test-Truthy $env:FORCE_COLOR) {
    return $true
  }

  if (
    $env:OS -eq 'Windows_NT' -and
    $PSVersionTable.PSVersion.Major -lt 7 -and
    [string]::IsNullOrWhiteSpace($env:WT_SESSION) -and
    [string]::IsNullOrWhiteSpace($env:TERM)
  ) {
    return $false
  }

  try {
    return (-not [Console]::IsOutputRedirected) -or (-not [Console]::IsErrorRedirected)
  } catch {
    return $true
  }
}

function Format-Style {
  param(
    [string]$Code,
    [string]$Text
  )

  if (-not $script:USE_COLOR) {
    return $Text
  }

  return '{0}[{1}m{2}{0}[0m' -f $script:ESCAPE, $Code, $Text
}

function bold {
  param([string]$Text)
  return Format-Style -Code '1;39' -Text $Text
}

function dim {
  param([string]$Text)
  return Format-Style -Code '2;39' -Text $Text
}

function green {
  param([string]$Text)
  return Format-Style -Code '32' -Text $Text
}

function red {
  param([string]$Text)
  return Format-Style -Code '1;31' -Text $Text
}

function yellow {
  param([string]$Text)
  return Format-Style -Code '33' -Text $Text
}

function tp {
  param([string]$Text)
  return Format-Style -Code '38;2;0;200;138' -Text $Text
}

function ts {
  param([string]$Text)
  return Format-Style -Code '38;2;219;39;119' -Text $Text
}

function Split-Csv {
  param([string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return @()
  }

  return @(
    $Value.Split(',') |
      ForEach-Object { $_.Trim() } |
      Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
  )
}

function Add-TrimmedValue {
  param(
    [System.Collections.Generic.List[string]]$List,
    [AllowNull()][string]$Value
  )

  if ($null -eq $Value) {
    return
  }

  $trimmed = $Value.Trim()
  if (-not [string]::IsNullOrWhiteSpace($trimmed)) {
    [void]$List.Add($trimmed)
  }
}

function Get-EnabledDisplay {
  param([AllowNull()][object]$Value)

  if (Test-Truthy $Value) {
    return 'on'
  }

  return 'off'
}

function Get-CsvDisplay {
  param([string[]]$Values)

  if ($null -eq $Values -or $Values.Count -eq 0) {
    return 'none'
  }

  return ($Values -join ',')
}

function Join-Arguments {
  param([string[]]$Values)

  if ($null -eq $Values -or $Values.Count -eq 0) {
    return ''
  }

  return (
    @(
    foreach ($value in $Values) {
      if ($value -match '\s') {
        '"{0}"' -f $value
      } else {
        $value
      }
    }
    ) -join ' '
  )
}

function Expand-Message {
  param(
    [AllowNull()][object]$Message,
    [object[]]$MessageArgs = @()
  )

  $normalized = if ($Message -is [string]) {
    $Message
  } else {
    ($Message | Out-String).TrimEnd()
  }

  if ($MessageArgs.Count -gt 0) {
    return $normalized -f $MessageArgs
  }

  return $normalized
}

function Write-StreamLine {
  param(
    [ValidateSet('stdout', 'stderr')]
    [string]$Stream = 'stdout',
    [string]$Message = ''
  )

  if ($Stream -eq 'stderr') {
    [Console]::Error.WriteLine($Message)
    return
  }

  [Console]::Out.WriteLine($Message)
}

function Write-StatusLine {
  param(
    [ValidateSet('stdout', 'stderr')]
    [string]$Stream,
    [string]$Label,
    [scriptblock]$Colorizer,
    [AllowNull()][object]$Message = '',
    [object[]]$MessageArgs = @()
  )

  $text = Expand-Message -Message $Message -MessageArgs $MessageArgs
  Write-StreamLine -Stream $Stream -Message ('{0}: {1}' -f (& $Colorizer $Label), $text)
}

function debug {
  param(
    [AllowNull()][object]$Message = '',
    [object[]]$MessageArgs = @()
  )

  if (-not $script:Resolved.Options.Debug) {
    return
  }

  $text = Expand-Message -Message $Message -MessageArgs $MessageArgs
  Write-StreamLine -Stream 'stderr' -Message ('{0} {1}' -f (dim 'debug'), $text)
}

function log {
  param(
    [AllowNull()][object]$Message = '',
    [object[]]$MessageArgs = @()
  )

  Write-StreamLine -Stream 'stdout' -Message (Expand-Message -Message $Message -MessageArgs $MessageArgs)
}

function note {
  param(
    [AllowNull()][object]$Message = '',
    [object[]]$MessageArgs = @()
  )

  Write-StatusLine -Stream 'stdout' -Label 'note' -Colorizer ${function:ts} -Message $Message -MessageArgs $MessageArgs
}

function success {
  param(
    [AllowNull()][object]$Message = '',
    [object[]]$MessageArgs = @()
  )

  Write-StatusLine -Stream 'stdout' -Label 'done' -Colorizer ${function:green} -Message $Message -MessageArgs $MessageArgs
}

function warn {
  param(
    [AllowNull()][object]$Message = '',
    [object[]]$MessageArgs = @()
  )

  Write-StatusLine -Stream 'stderr' -Label 'warn' -Colorizer ${function:yellow} -Message $Message -MessageArgs $MessageArgs
}

function fail {
  param(
    [string]$Message,
    [int]$ExitCode = 1
  )

  Write-StatusLine -Stream 'stderr' -Label 'error' -Colorizer ${function:red} -Message $Message
  exit $ExitCode
}

function Build-Environment {
  return [ordered]@{
    Force = Test-Truthy $env:TANAAB_FORCE
    Debug = Test-Truthy (Get-FirstNonEmpty @($env:TANAAB_DEBUG, $env:RUNNER_DEBUG))
    Item = @(Split-Csv $env:TANAAB_ITEM)
  }
}

function Build-Defaults {
  return [ordered]@{
    Force = $false
    Debug = $false
    Item = @()
  }
}

function Build-EnvironmentVariables {
  param($Invocation)

  return @(
    '  TANAAB_DEBUG    set to a truthy value to show debug messages'
    '  TANAAB_FORCE    set to a truthy value to enable force mode'
    ('  TANAAB_ITEM     comma-separated repeatable items {0}' -f (dim ('[default: {0}]' -f (Get-CsvDisplay $Invocation.Environment.Item))))
  )
}

function Resolve-Invocation {
  $defaults = Build-Defaults
  $environment = Build-Environment
  $items = New-Object 'System.Collections.Generic.List[string]'
  $resolvedForce = [bool]$environment.Force
  $resolvedDebug = [bool]$environment.Debug

  foreach ($entry in @($environment.Item)) {
    Add-TrimmedValue -List $items -Value $entry
  }

  if ($PSBoundParameters.ContainsKey('Item')) {
    # Any CLI-provided repeatable parameter replaces the env-seeded list for that option.
    $items.Clear()
    foreach ($entry in @($Item)) {
      Add-TrimmedValue -List $items -Value $entry
    }
  }

  if ($PSBoundParameters.ContainsKey('Force')) {
    $resolvedForce = [bool]$Force
  }

  if ($PSBoundParameters.ContainsKey('Debug')) {
    $resolvedDebug = [bool]$Debug
  }

  return [pscustomobject]@{
    Defaults = [pscustomobject]$defaults
    Environment = [pscustomobject]$environment
    Options = [pscustomobject]@{
      Force = $resolvedForce
      Debug = $resolvedDebug
      Item = @($items.ToArray())
    }
    Positionals = @($Positionals)
  }
}

function Show-Version {
  Write-StreamLine -Stream 'stdout' -Message $script:SCRIPT_VERSION
  exit 0
}

function Show-Usage {
  param(
    [Parameter(Mandatory)]
    $Invocation,
    [switch]$NoExit
  )

  $environmentVariables = Build-EnvironmentVariables -Invocation $Invocation
  $lines = @(
    ('Usage: {0} {1}' -f (bold $script:CLI_NAME), (dim '[-Force] [-Item <String[]>] [-Debug] [-Version] [-Help] [arguments...]'))
    ''
    ('{0}:' -f (tp 'Options'))
    ('  -Force            enables force mode {0}' -f (dim ('[default: {0}]' -f (Get-EnabledDisplay $Invocation.Options.Force))))
    ('  -Item <String[]>  adds repeatable items {0}' -f (dim ('[default: {0}]' -f (Get-CsvDisplay $Invocation.Options.Item))))
    ('  -Debug            shows debug messages {0}' -f (dim ('[default: {0}]' -f (Get-EnabledDisplay $Invocation.Options.Debug))))
    ('  -Version          shows the CLI version {0}' -f (dim ('[default: {0}]' -f $script:SCRIPT_VERSION)))
    '  -Help             displays this help message'
  )

  if ($environmentVariables.Count -gt 0) {
    $lines += ''
    $lines += ('{0}:' -f (tp 'Environment Variables'))
    $lines += $environmentVariables
  }

  Write-StreamLine -Stream 'stdout' -Message ($lines -join [Environment]::NewLine)
  if (-not $NoExit) {
    exit 0
  }
}

function Invoke-RunCli {
  param(
    [Parameter(Mandatory)]
    $Invocation
  )

  $positionalsDisplay = if ($Invocation.Positionals.Count -gt 0) {
    Join-Arguments -Values $Invocation.Positionals
  } else {
    'none'
  }

  debug 'raw args {0} {1}' $script:CLI_NAME, (Join-Arguments -Values $script:OriginalArgs)
  debug 'raw Debug={0}' $Invocation.Options.Debug
  debug 'raw Force={0}' $Invocation.Options.Force
  debug 'raw Item={0}' (Get-CsvDisplay $Invocation.Options.Item)
  debug 'raw Positionals={0}' $positionalsDisplay

  if ($Invocation.Positionals.Count -gt 0) {
    warn 'handle or reject positional arguments before shipping this CLI'
  }

  note 'received repeatable items: {0}' (Get-CsvDisplay $Invocation.Options.Item)
  note 'replace Invoke-RunCli with project-specific behavior'
  success 'wire your command execution flow here'
}

$script:USE_COLOR = Test-ColorEnabled
$script:OriginalArgs = @($args)

if (-not $SCRIPT_VERSION) {
  $SCRIPT_VERSION = Get-ScriptVersion
}

$script:Resolved = Resolve-Invocation

if ($Help) {
  Show-Usage -Invocation $script:Resolved
}

if ($Version) {
  Show-Version
}

Invoke-RunCli -Invocation $script:Resolved
