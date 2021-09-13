import * as observer from "./computedStyleObserver";
import {Referentiel} from "referentiel";

const CSSHoudiniSupport = (typeof StylePropertyMap != "undefined");
var registered = false;

if (CSSHoudiniSupport && !window.CSSBasePropertiesRegistered) {
  CSS.registerProperty({ name: '--border-left-width', syntax: '<length>', inherits: true, initialValue: `0px`, });
  CSS.registerProperty({ name: '--border-right-width', syntax: '<length>', inherits: true, initialValue: `0px`, });
  CSS.registerProperty({ name: '--border-top-width', syntax: '<length>', inherits: true, initialValue: `0px`, });
  CSS.registerProperty({ name: '--border-bottom-width', syntax: '<length>', inherits: true, initialValue: `0px`, });
  CSS.registerProperty({ name: '--padding-left', syntax: '<length>', inherits: true, initialValue: `0px`, });
  CSS.registerProperty({ name: '--padding-right', syntax: '<length>', inherits: true, initialValue: `0px`, });
  CSS.registerProperty({ name: '--padding-top', syntax: '<length>', inherits: true, initialValue: `0px`, });
  CSS.registerProperty({ name: '--padding-bottom', syntax: '<length>', inherits: true, initialValue: `0px`, });
  CSS.registerProperty({ name: '--border-box-width', syntax: '<length>', inherits: true, initialValue: `0px`, });
  CSS.registerProperty({ name: '--border-box-height', syntax: '<length>', inherits: true, initialValue: `0px`, });
  CSS.registerProperty({ name: '--content-box-width', syntax: '<length>', inherits: true, initialValue: `0px`, });
  CSS.registerProperty({ name: '--content-box-height', syntax: '<length>', inherits: true, initialValue: `0px`, });
  CSS.registerProperty({ name: '--padding-box-width', syntax: '<length>', inherits: true, initialValue: `0px`, });
  CSS.registerProperty({ name: '--padding-box-height', syntax: '<length>', inherits: true, initialValue: `0px`, });
  CSS.registerProperty({ name: '--width', syntax: '<length>', inherits: true, initialValue: `0px`, });
  CSS.registerProperty({ name: '--height', syntax: '<length>', inherits: true, initialValue: `0px`, });
  CSS.registerProperty({ name: '--page-x', syntax: '<length>', inherits: true, initialValue: `0px`, });
  CSS.registerProperty({ name: '--page-y', syntax: '<length>', inherits: true, initialValue: `0px`, });
  CSS.registerProperty({ name: '--border-box-mouse-x', syntax: '<length>', inherits: true, initialValue: `0px`, });
  CSS.registerProperty({ name: '--border-box-mouse-y', syntax: '<length>', inherits: true, initialValue: `0px`, });
  console.log("CSS properties registered");
  window.CSSBasePropertiesRegistered = true;
}

let convertToUnparsed = (px) => {
  return new CSSUnparsedValue([px.toString()]);
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

let setStyleProperty = (element, key, value)=>{
  if (CSSHoudiniSupport && element.attributeStyleMap) {
    element.attributeStyleMap.set(key, convertToUnparsed(value));
  } else {
    element.style.setProperty(key, value);
  }
}

let applyProperties = (element, computedStyle) => {
  for (let key in propMap) {
    let functor = propMap[key];
    let value = null;
    if (typeof functor == "function") { value = functor(element, computedStyle); };
    if (typeof functor === 'string' || functor instanceof String) { value = convert(computedStyle.getPropertyValue(functor)); };
    setStyleProperty(element, key, value);
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
      
      /*
      let flamer = observer.asyncAnimationFrame();
      element.addEventListener("resize", async ()=>{
        await flamer.next();
        applyProperties(element, window.getComputedStyle(element, options.pseudo));
      });
      */
    }
  });
  
  return obj;

};

let documentMouse = {
  pageX: 0, pageY: 0, listening: false
};

let listenDocument = () => {
  if (!documentMouse.listening) {
    documentMouse.listening = true;
    document.addEventListener("mousemove", (e)=>{
      documentMouse.pageX = e.pageX, documentMouse.pageY = e.pageY;
    }, true);

    let flamer = observer.asyncAnimationFrame();
    (async()=>{
      do {
        setStyleProperty(document.documentElement, "--page-x", makePixel(documentMouse.pageX));
        setStyleProperty(document.documentElement, "--page-y", makePixel(documentMouse.pageY));
        await flamer.next();
      } while(documentMouse.listening);
    })();
  };

  return documentMouse;
}

let listenMouse = (arg, options) => {
  let elements = [];
  if (typeof arg === 'string' || arg instanceof String) { elements = document.querySelectorAll(arg); };
  if (Array.isArray(arg)) { elements = arg; }; 
  if (isElement(arg)) elements = [arg];

  // 
  let obj = {
    listening: true,
    elements: elements,
    observers: []
  };

  listenDocument();

  let flamer = observer.asyncAnimationFrame();
  (async()=>{
    do {
      elements.forEach((element)=>{
        let point = Referentiel.convertPointFromPageToNode(element, [documentMouse.pageX, documentMouse.pageY]);
        setStyleProperty(element, "--padding-box-mouse-x", makePixel(point[0]));
        setStyleProperty(element, "--padding-box-mouse-y", makePixel(point[1]));
      });
      await flamer.next();
    } while(obj.listening);
  })();

  return obj;
}

export {updateProperties, listenMouse, documentMouse};
