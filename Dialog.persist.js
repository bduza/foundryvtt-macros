if (typeof Dialog.persist !== "function")
Object.getPrototypeOf(Dialog).persist = function(data, options) {
  let w = Object.values(ui.windows).find(w=> w.id===options.id);
  let position = w?.position || {};
  options = {...options, ...position};
  new Dialog(data, options).render(true);
  if (w) w.bringToTop();
  if (w) w.setPosition({height:'auto'})  
  return;
}