# GitHub Issue Work Size Resolution

Use this contract whenever a Piroplugin workflow needs the current native `Work size` for one exact
GitHub issue. This is a read-only evidence path. It never estimates, writes metadata, requests
GitHub Projects access, or changes authentication.

## Provider Order

1. Establish one exact canonical `owner/repo#number` issue identity. Resolve the issue through the
   native GitHub connector when it is available. A workflow that already requires the connector
   keeps that prerequisite. Otherwise continue only when the issue identity is proven by the
   workflow's authoritative source, such as a Codex task's original assignment or explicit current
   outcome; never infer it from a title or nearby pull request.
2. When the connector exposes native issue-field values, inspect every field named `Work size`
   case-insensitively. Use the connector result only when it resolves to one canonical value under
   the interpretation rules below.
3. When connector-native Work size is absent, unsupported, conflicting, or not exposed, call the
   canonical repository issue-field endpoint through the CLI route already verified by
   [`GitHub Read Access`](./github-read-access.md):

   ```sh
   gh api \
     "/repos/<owner>/<repo>/issues/<number>/issue-field-values?per_page=100" \
     --method GET \
     -H "X-GitHub-Api-Version: 2026-03-10" \
     --paginate \
     --slurp
   ```

   Flatten the returned page arrays once before interpreting the fields. Preserve the exact endpoint
   and sanitized command error when the read fails.

Do not use GitHub Projects GraphQL, request `read:project`, change tokens or connector setup, inspect
project items, or use issue-body fallback metadata for this lookup. A failed canonical endpoint read
remains unavailable; do not improvise another provider route.

## Interpretation

- Match field names after trimming and lowercasing. Recognize response variants such as
  `issue_field_name`, `name`, `field.name`, or `issue_field.name`.
- Read the scalar from the first available supported response shape, including
  `single_select_option.name`, `value.name`, `value`, or `number_value`.
- Treat `null`, an empty string, and whitespace-only strings as unset observations.
- Accept only the numeric values `1`, `2`, `3`, `5`, `8`, `13`, and `21`. Numeric strings for those
  exact values are equivalent to their numbers. Do not estimate, round, clamp, or otherwise
  normalize another value into the allowed set.
- Identical repeated canonical observations are one verified value.
- Distinct non-empty observations, or a mixture of canonical and unsupported observations, are
  conflicting. Do not select one by field order.

Return one of these evidence outcomes:

- **verified:** one canonical value, with `connector-native` or `issue-field-values` as its source;
- **missing:** no matching field or every matching observation is unset;
- **unsupported:** the only distinct non-empty observation is outside the allowed set;
- **conflicting:** matching non-empty observations disagree or mix supported and unsupported values;
- **endpoint unavailable:** `gh` is missing, authentication or authorization fails, the endpoint
  returns an error such as the known personal-repository `HTTP 404`, pagination is incomplete, or
  the response is not valid JSON.

For every non-verified outcome, preserve the canonical issue, provider attempted, exact reason, and
relevant observed values or sanitized error. Do not convert an exclusion into zero.

## Consumer Reporting

- Deduplicate by canonical issue before summing verified values.
- Keep pull-request-only work, report-only work, and every non-verified issue outside Work size
  totals.
- Report the verified subtotal and every exclusion separately. When archived issue work exists but
  none has a verified Work size, report a verified subtotal of `0` plus the exclusions; do not state
  an unqualified completed capacity of `0`.
- Keep Work size distinct from elapsed time, completed effort, productivity, and composite scores.

## Static Scenarios

- Connector-native `Work size = 5` verifies `5` without an endpoint call.
- A connector issue with no exposed native fields followed by endpoint `Work size = 5` verifies `5`.
- No matching endpoint field, or only an unset field, is missing.
- Endpoint `Work size = 4` is unsupported.
- Endpoint observations `5` and `8` are conflicting; two observations of `5` verify `5`.
- A personal-repository `HTTP 404` is endpoint unavailable and does not trigger GraphQL, body
  fallback, token changes, or connector reconfiguration.
- Two deduplicated archived issues with verified size `5` produce a verified completed subtotal of
  `10`.
