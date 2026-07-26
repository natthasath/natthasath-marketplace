# GA4 Data API — Common Dimensions & Metrics

Reference for building `run_report` / `run_funnel_report` / `run_realtime_report` calls
through the `google-analytics-mcp` tools. This is not exhaustive — if a report needs a
field not listed here, call `get_custom_dimensions_and_metrics` to confirm the exact
API name for that property rather than guessing.

## Metrics

| Metric | Meaning |
|---|---|
| `sessions` | Number of sessions |
| `totalUsers` | Unique users |
| `activeUsers` | Users with an engaged session |
| `screenPageViews` | Page/screen views |
| `engagementRate` | % of sessions that were "engaged" |
| `averageSessionDuration` | Avg. session length (seconds) |
| `bounceRate` | Inverse of engagement rate |
| `conversions` | Conversion event count |
| `eventCount` | Total event count |

## Dimensions

| Dimension | Meaning |
|---|---|
| `date` | Calendar date (YYYYMMDD) |
| `pagePath` | URL path viewed |
| `pageTitle` | Page `<title>` |
| `landingPage` | First page of the session |
| `sessionDefaultChannelGrouping` | Organic Search, Paid Search, Direct, Referral, Social, etc. |
| `country` | User's country |
| `deviceCategory` | desktop / mobile / tablet |
| `browser` | Browser name |

## Mapping use cases to reports

| Use case | Tool | Suggested dimensions | Suggested metrics |
|---|---|---|---|
| Traffic summary (WoW/MoM) | `run_report`, called twice (current period + comparison period) | `date` | `sessions`, `totalUsers`, `screenPageViews`, `engagementRate` |
| Top pages / landing pages | `run_report` | `pagePath` (or `landingPage`) | `screenPageViews`, `totalUsers`, `engagementRate` |
| Traffic source/channel breakdown | `run_report` | `sessionDefaultChannelGrouping` | `sessions`, `totalUsers`, `conversions` |
| Funnel/conversion tracking | `run_funnel_report` | (funnel steps defined per call) | conversion rate per step |
| Real-time active users | `run_realtime_report` | — | active users right now |
| Audience demographics | `run_report` | `country`, `deviceCategory`, or `browser` (one dimension at a time reads cleanest in a chart) | `totalUsers`, `sessions` |

Calling `run_report` twice (once per period) and computing the delta yourself is
simpler and more transparent than trying to get the API to return a built-in
comparison — do the WoW/MoM math in the report you build, not inside the API call.
