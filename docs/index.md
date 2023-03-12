# Migrate your Custom Objects to Big Objects

- Step 1

  ```
  Choose Objects. TODO: add description
  ```

- Step 2

  ```
  Choose Fields. TODO: add description
  ```

- Step 3

  ```
  Query. TODO: add description
  ```

- Step 4

  ```
  Scheduling. TODO: add description
  ```

---

## Display details

<details>
 <summary><code>POST</code> <code><b>/</b></code> <code>(overwrites all in-memory stub and/or proxy-config)</code></summary>

##### Parameters

> | name | type     | data type             | description |
> | ---- | -------- | --------------------- | ----------- |
> | None | required | object (JSON or YAML) | N/A         |

##### Responses

> | http code | content-type               | response                                 |
> | --------- | -------------------------- | ---------------------------------------- |
> | `201`     | `text/plain;charset=UTF-8` | `Configuration created successfully`     |
> | `400`     | `application/json`         | `{"code":"400","message":"Bad Request"}` |
> | `405`     | `text/html;charset=utf-8`  | None                                     |
