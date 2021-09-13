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

Currently allows to use such vars from CSS, if you set by JS.

```css
#element {
  left: calc(100% - calc(var(--border-box-width) / 2));
  top: calc(100% - calc(var(--border-box-height) / 2));
  /*
    also we have: 
    --border-box-width
    --border-box-height
    --content-box-width
    --content-box-height
    --padding-box-width
    --padding-box-height
    --padding-left
    --padding-right
    --padding-top
    --padding-bottom
    --border-left-width
    --border-right-width
    --border-top-width
    --border-bottom-width
    --width
    --height
  */
}
```

### **PLEASE, DO NOT USE SUCH COMBINATIONS**

- `--padding-{side}` with `padding-{side}` property.
- `--border-{side}-width` with `border-{side}-width` property.
- `--content-box-width`, `--padding-box-width`, `--border-box-width` with `width`, `padding-[left|right]` or `border-[left|right]-width` property.
- `--content-box-height`, `--padding-box-height`, `--border-box-height` with `height`, `padding-[top|bottom]` or `border-[top|bottom]-width` property.
- `--width` with `width` property.
- `--height` with `height` property.

Because possible conflicts and side-effects. 
