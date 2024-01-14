# kv-d1-benchmark

This simple Worker was created to compare the response times between Cloudflare KV and D1. Since Cloudflare doesn't seem to
offer any emperical analysis between the two, this repo at least gives a simple comparision between to two. Keep in mind, this
is a very simple comparision, using only a single zone (assumedly).

## Results

The results seem to show that D1 is at least as fast as KV, and in most cases faster. This doesn't take into account cross-region
propagation delays, since I don't know of a good way to test that easily.

I'd refrain from drawing any other big conclusions from this data, this is a very simple test.

_`insert_and_propagate` tests will insert a value, then query within a loop until the newly inserted value is returned_

| Metric                  | Description                        | Time  |
| ----------------------- | ---------------------------------- | ----- |
| kv_insert               | Insert value into KV               | 138ms |
| kv_read                 | Read existing value from KV        | 17ms  |
| kv_insert_and_propagate | Insert and read value back from KV | 105ms |
| d1_insert               | Insert value into D1               | 45ms  |
| d1_read                 | Read existing value from D1        | 16ms  |
| d1_insert_and_propagate | Insert and read value back from D1 | 66ms  |

## Setup

You'll need the following created in Cloudflare:

- D1 Database
- KV Namespace

Fork this repo, and update the `wrangler.toml` file with the configuration for your D1 and KV namespaces.

After that, simply running `npm run deploy` will deploy the worker to your Cloudflare account and setup the bindings. From there, simply invoke
the Worker to get the benchmarks.
