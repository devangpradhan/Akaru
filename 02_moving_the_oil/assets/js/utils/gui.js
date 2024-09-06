let gui;

if (process.browser) {
  const dat = require('dat.gui');

  gui = new dat.GUI();
  gui.domElement.parentNode.style.zIndex = 1000;
}

export default gui;
