# ACTION_NAME

One or two sentences that explain what the action does, who it is for, and the workflow problem it solves.

> Optional: add a short status, compatibility, or support note when readers need it before copying the action into a workflow.

## Inputs

Document every supported action input in one table.

| Name         | Description                           | Default         | Example   |
| ------------ | ------------------------------------- | --------------- | --------- |
| `input-name` | What it controls and when it matters. | `default-value` | `example` |

## Outputs

Use this section only when the action actually sets outputs.

| Name          | Description                     | Example |
| ------------- | ------------------------------- | ------- |
| `output-name` | What it returns to later steps. | `value` |

Delete this section if the action has no outputs.

## Caveats

Use this section for action-specific contract details users need before relying on the action.

- Required permissions
- Trigger-specific behavior
- Checkout or repository assumptions
- Runner, shell, or filesystem caveats

## Usage

### Basic Usage

```yaml
- name: Run ACTION_NAME
  uses: ORG/REPO@v1
```

### Advanced Usage

```yaml
- name: Run ACTION_NAME
  uses: ORG/REPO@v1
  with:
    input-name: value
```

If the action also has a VitePress docs site, add a short `Documentation` section after `Usage` that links deeper guides. Keep the input, output, caveat, and usage contract in this README even when deeper docs exist elsewhere.

## Development

Keep this section contributor-focused and repo-specific.

```sh
INSTALL_COMMAND
LINT_COMMAND
TEST_COMMAND
BUILD_COMMAND
```

## Changelog

Link to `CHANGELOG.md` and releases when the action maintains them.

## Releasing

Describe the release trigger only when maintainers need a short repo-local reminder.

## Maintainers

- `@MAINTAINER`

## Contributors

<a href="https://github.com/REPO_SLUG/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=REPO_SLUG" />
</a>

Made with [contrib.rocks](https://contrib.rocks).
