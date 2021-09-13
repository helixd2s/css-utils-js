import * as observer from "./computedStyleObserver";

const CSSHoudiniSupport = (typeof StylePropertyMap != "undefined");

if (CSSHoudiniSupport) {
  CSS.registerProperty({ name: '--border-left-width', syntax: '<length>', inherits: false, initialValue: `0px`, });
  CSS.registerProperty({ name: '--border-right-width', syntax: '<length>', inherits: false, initialValue: `0px`, });
  CSS.registerProperty({ name: '--border-top-width', syntax: '<length>', inherits: false, initialValue: `0px`, });
  CSS.registerProperty({ name: '--border-bottom-width', syntax: '<length>', inherits: false, initialValue: `0px`, });
  CSS.registerProperty({ name: '--padding-left', syntax: '<length>', inherits: false, initialValue: `0px`, });
  CSS.registerProperty({ name: '--padding-right', syntax: '<length>', inherits: false, initialValue: `0px`, });
  CSS.registerProperty({ name: '--padding-top', syntax: '<length>', inherits: false, initialValue: `0px`, });
  CSS.registerProperty({ name: '--padding-bottom', syntax: '<length>', inherits: false, initialValue: `0px`, });
  CSS.registerProperty({ name: '--border-box-width', syntax: '<length>', inherits: false, initialValue: `0px`, });
  CSS.registerProperty({ name: '--border-box-height', syntax: '<length>', inherits: false, initialValue: `0px`, });
  CSS.registerProperty({ name: '--content-box-width', syntax: '<length>', inherits: false, initialValue: `0px`, });
  CSS.registerProperty({ name: '--content-box-height', syntax: '<length>', inherits: false, initialValue: `0px`, });
  CSS.registerProperty({ name: '--padding-box-width', syntax: '<length>', inherits: false, initialValue: `0px`, });
  CSS.registerProperty({ name: '--padding-box-height', syntax: '<length>', inherits: false, initialValue: `0px`, });
  CSS.registerProperty({ name: '--width', syntax: '<length>', inherits: false, initialValue: `0px`, });
  CSS.registerProperty({ name: '--height', syntax: '<length>', inherits: false, initialValue: `0px`, });
}

let convertToUnparsed = (px) => {
  return new CSSUnparsedValue([`${px.value}px`]);
}

let makePixel = (px) => {
  return px && px != "auto" ? (CSSHoudiniSupport ? CSS.px(px) : `${px}px`) : (CSSHoudiniSupport ? new CSSUnparsedValue([`auto`]) : `auto`);
}

let convert = (px) => {
  return px && px != "auto" ? (CSSHoudiniSupport ? CSSNumericValue.parse(px) : px) : (CSSHoudiniSupport ? new CSSUnparsedValue([`auto`]) : `auto`);
}

//Returns true if it is a DOM node
function isNode(o){
  return (
    typeof Node === "object" ? o instanceof Node : 
    o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
  );
}

//Returns true if it is a DOM element    
function isElement(o){
  return (
    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
);
}

let propMap = {
  "--content-box-width": (element, computed)=>{
    let width = element.clientWidth;
    let paddingLeft = computed.getPropertyValue("padding-left").match(/\d+/);
    let paddingRight = computed.getPropertyValue("padding-right").match(/\d+/);
    return makePixel(width - paddingLeft - paddingRight);
  },
  "--content-box-height": (element, computed)=>{
    let height = element.clientHeight;
    let paddingTop = computed.getPropertyValue("padding-top").match(/\d+/);
    let paddingBottom = computed.getPropertyValue("padding-bottom").match(/\d+/);
    return makePixel(height - paddingTop - paddingBottom);
  },
  "--border-box-width": (element, computed)=>{
    let width = element.offsetWidth;
    return makePixel(width);
  },
  "--border-box-height": (element, computed)=>{
    let height = element.offsetHeight;
    return makePixel(height);
  },
  "--padding-box-width": (element, computed)=>{
    let width = element.clientWidth;
    return makePixel(width);
  },
  "--padding-box-height": (element, computed)=>{
    let height = element.clientHeight;
    return makePixel(height);
  },
  "--width": "width",
  "--height": "height",
  "--padding-left": "padding-left",
  "--padding-right": "padding-right",
  "--border-top-width": "border-top-width",
  "--border-bottom-width": "border-bottom-width",
  "--border-left-width": "border-left-width",
  "--border-right-width": "border-right-width"
};

let applyProperties = (element, computedStyle) => {
  for (let key in propMap) {
    let functor = propMap[key];
    let value = null;
    if (typeof functor == "function") { value = functor(element, computedStyle); };
    if (typeof functor === 'string' || functor instanceof String) { value = convert(computedStyle.getPropertyValue(functor)); };
    if (CSSHoudiniSupport && element.attributeStyleMap) {
      element.attributeStyleMap.set(key, value);
    } else {
      element.style.setProperty(key, value);
    }
  }
}

let updateProperties = (arg, options) => {
  let elements = [];
  if (typeof arg === 'string' || arg instanceof String) { elements = document.querySelectorAll(arg); };
  if (Array.isArray(arg)) { elements = arg; }; 
  if (isElement(arg)) elements = [arg];

  // 
  let obj = {
    elements: elements,
    observers: []
  };

  // 
  elements.forEach((element)=>{ 
    let computedStyle = window.getComputedStyle(element, options.pseudo);
    applyProperties(element, computedStyle);
    if (options.observe) {
      let observe = new observer.ComputedStyleObserver(element, options.pseudo, ["width", "height", "padding-left", "padding-right", "border-top-width", "border-bottom-width", "border-left-width", "border-right-width"]);
      observe.addListener((entry)=>{
        applyProperties(element, entry.computed);
      });
      obj.observers.push(observe);
    }
  });
  
  return obj;

};

export {updateProperties};
