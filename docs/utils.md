# Utilities API

## wrapError()

Ensure a value is an instance of an `Error` or child class.

**Parameters:**
- `value` - The value to wrap
- `constructor` - The `Error` class constructor

**Returns:** `Error` or child class instance

```typescript
import { wrapError, SeidrError } from '@fimbul-works/seidr';

const error = wrapError('Something went wrong', SeidrError)
```
---

[Seidr](https://github.com/fimbul-works/seidr) brought to you by [FimbulWorks](https://github.com/fimbul-works) | [README.md](../README.md) | [API.md](API.md)
