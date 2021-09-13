# Scripted utils for CSS

I made JS and SCSS utils for CSS developers. 

```js
import {CSObserver, PropertyMapper} from 'css-utils-js';
const ComputedStyleObserver = CSObserver.ComputedStyleObserver;

let mapping = PropertyMapper.updateProperties(".faq", {
  pseudo: "",
  observe: true
});
```
