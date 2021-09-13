# css-utils

I made JS and SCSS utils for CSS developers. 

```js
import {CSObserver, PropertyMapper} from 'css-utils';
const ComputedStyleObserver = CSObserver.ComputedStyleObserver;

let mapping = PropertyMapper.updateProperties(".faq", {
  pseudo: "",
  observe: true
});
```
