import observer from "./computedStyleObserver";


let convertToUnparsed = (px) => {
  return new CSSUnparsedValue([`${px.value}px`]);
}

let makePixel = (px) => {
  return px && px != "auto" ? (typeof CSS != "undefined" ? CSS.px(px) : `${px}px`) : (typeof CSS != "undefined" ? new CSSUnparsedValue([`auto`]) : `auto`);
}

let convert = (px) => {
  return px && px != "auto" ? (typeof CSSNumericValue.parse != "undefined" ? CSSNumericValue.parse(px) : px) : (typeof CSS != "undefined" ? new CSSUnparsedValue([`auto`]) : `auto`);
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
    if (element.attributeStyleMap) {
      element.attributeStyleMap.set(key, convertToUnparsed(value));
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

export default {updateProperties};
