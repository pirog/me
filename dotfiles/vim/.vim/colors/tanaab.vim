" Tanaab terminal colors
" Semantic Vim colors mapped onto the active terminal's 16 ANSI slots.

highlight clear
if exists('syntax_on')
  syntax reset
endif

let g:colors_name = 'tanaab'

" Editor chrome.
highlight Normal cterm=NONE ctermfg=NONE ctermbg=NONE
highlight NormalFloat cterm=NONE ctermfg=7 ctermbg=0
highlight Cursor cterm=reverse ctermfg=NONE ctermbg=NONE
if &background ==# 'dark'
  highlight CursorLine term=NONE cterm=NONE ctermfg=NONE ctermbg=0 gui=NONE guifg=NONE guibg=NONE
  highlight CursorColumn term=NONE cterm=NONE ctermfg=NONE ctermbg=0 gui=NONE guifg=NONE guibg=NONE
  highlight ColorColumn term=NONE cterm=NONE ctermfg=NONE ctermbg=0 gui=NONE guifg=NONE guibg=NONE
else
  highlight CursorLine term=NONE cterm=NONE ctermfg=NONE ctermbg=NONE gui=NONE guifg=NONE guibg=NONE
  highlight CursorColumn term=NONE cterm=NONE ctermfg=NONE ctermbg=NONE gui=NONE guifg=NONE guibg=NONE
  highlight ColorColumn term=NONE cterm=NONE ctermfg=NONE ctermbg=NONE gui=NONE guifg=NONE guibg=NONE
endif
highlight LineNr cterm=NONE ctermfg=8 ctermbg=NONE
highlight CursorLineNr cterm=bold ctermfg=2 ctermbg=NONE
highlight SignColumn cterm=NONE ctermfg=8 ctermbg=NONE
highlight VertSplit cterm=NONE ctermfg=8 ctermbg=NONE
highlight WinSeparator cterm=NONE ctermfg=8 ctermbg=NONE
highlight Folded cterm=NONE ctermfg=8 ctermbg=NONE
highlight FoldColumn cterm=NONE ctermfg=8 ctermbg=NONE
highlight NonText cterm=NONE ctermfg=8 ctermbg=NONE
highlight SpecialKey cterm=NONE ctermfg=8 ctermbg=NONE
highlight EndOfBuffer cterm=NONE ctermfg=8 ctermbg=NONE
highlight Directory cterm=bold ctermfg=4 ctermbg=NONE
highlight Title cterm=bold ctermfg=2 ctermbg=NONE
highlight Question cterm=bold ctermfg=2 ctermbg=NONE
highlight MoreMsg cterm=bold ctermfg=2 ctermbg=NONE
highlight WarningMsg cterm=bold ctermfg=3 ctermbg=NONE
highlight ErrorMsg cterm=bold ctermfg=15 ctermbg=1

" Selection, search, and completion.
highlight Visual cterm=reverse ctermfg=NONE ctermbg=NONE
highlight Search cterm=bold ctermfg=0 ctermbg=11
highlight IncSearch cterm=bold ctermfg=0 ctermbg=13
highlight MatchParen cterm=bold,underline ctermfg=14 ctermbg=NONE
highlight Pmenu cterm=NONE ctermfg=7 ctermbg=0
highlight PmenuSel cterm=bold ctermfg=0 ctermbg=10
highlight PmenuSbar cterm=NONE ctermfg=NONE ctermbg=8
highlight PmenuThumb cterm=NONE ctermfg=NONE ctermbg=7
highlight WildMenu cterm=bold ctermfg=0 ctermbg=10

" Diff and diagnostics.
highlight Added cterm=NONE ctermfg=10 ctermbg=NONE
highlight Changed cterm=NONE ctermfg=12 ctermbg=NONE
highlight Removed cterm=NONE ctermfg=9 ctermbg=NONE
highlight DiffAdd cterm=NONE ctermfg=10 ctermbg=0
highlight DiffChange cterm=NONE ctermfg=12 ctermbg=0
highlight DiffDelete cterm=NONE ctermfg=9 ctermbg=0
highlight DiffText cterm=bold ctermfg=0 ctermbg=12
highlight Error cterm=bold ctermfg=15 ctermbg=1
highlight Todo cterm=bold ctermfg=0 ctermbg=11

" Syntax semantics.
highlight Comment cterm=italic ctermfg=8 ctermbg=NONE
highlight Constant cterm=NONE ctermfg=13 ctermbg=NONE
highlight String cterm=NONE ctermfg=6 ctermbg=NONE
highlight Character cterm=NONE ctermfg=14 ctermbg=NONE
highlight Number cterm=NONE ctermfg=13 ctermbg=NONE
highlight Boolean cterm=bold ctermfg=13 ctermbg=NONE
highlight Float cterm=NONE ctermfg=13 ctermbg=NONE
highlight Identifier cterm=NONE ctermfg=4 ctermbg=NONE
highlight Function cterm=bold ctermfg=2 ctermbg=NONE
highlight Statement cterm=bold ctermfg=5 ctermbg=NONE
highlight PreProc cterm=NONE ctermfg=3 ctermbg=NONE
highlight Type cterm=bold ctermfg=4 ctermbg=NONE
highlight Special cterm=NONE ctermfg=6 ctermbg=NONE
highlight Underlined cterm=underline ctermfg=4 ctermbg=NONE
highlight Ignore cterm=NONE ctermfg=8 ctermbg=NONE

" Tanaab UI accents.
highlight StatusLine cterm=reverse ctermfg=NONE ctermbg=NONE
highlight StatusLineNC cterm=NONE ctermfg=8 ctermbg=NONE
highlight TanaabStatusGreen cterm=bold ctermfg=2 ctermbg=NONE
highlight TanaabStatusPink cterm=bold ctermfg=5 ctermbg=NONE
highlight TanaabWelcomeFrame cterm=NONE ctermfg=8 ctermbg=NONE
highlight TanaabWelcomeLogo cterm=bold ctermfg=NONE ctermbg=NONE
highlight TanaabWelcomeGreen cterm=bold ctermfg=2 ctermbg=NONE
highlight TanaabWelcomePink cterm=bold ctermfg=5 ctermbg=NONE
highlight TanaabWelcomeYellow cterm=bold ctermfg=3 ctermbg=NONE
highlight TanaabWelcomeOnline cterm=bold ctermfg=2 ctermbg=NONE
highlight TanaabWelcomeOffline cterm=bold ctermfg=1 ctermbg=NONE
highlight TanaabWelcomeMuted cterm=NONE ctermfg=8 ctermbg=NONE
highlight TanaabWelcomeKey cterm=bold ctermfg=4 ctermbg=NONE

highlight! link Conditional Statement
highlight! link Repeat Statement
highlight! link Label Statement
highlight! link Operator Statement
highlight! link Keyword Statement
highlight! link Exception Statement
highlight! link Include PreProc
highlight! link Define PreProc
highlight! link Macro PreProc
highlight! link PreCondit PreProc
highlight! link StorageClass Type
highlight! link Structure Type
highlight! link Typedef Type
highlight! link Tag Special
highlight! link Delimiter Special
highlight! link SpecialComment Special
highlight! link Debug Special
