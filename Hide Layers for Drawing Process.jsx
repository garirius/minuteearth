//adds a Hide All mask to a layer
function addMask(lay){
  var prev = activeDocument.activeLayer;
  activeDocument.activeLayer = lay;
  try{
    var idMk = charIDToTypeID( "Mk  " );
    var desc2 = new ActionDescriptor();
    var idNw = charIDToTypeID( "Nw  " );
    var idChnl = charIDToTypeID( "Chnl" );
    desc2.putClass( idNw, idChnl );
    var idAt = charIDToTypeID( "At  " );
    var ref1 = new ActionReference();
    var idChnl = charIDToTypeID( "Chnl" );
    var idChnl = charIDToTypeID( "Chnl" );
    var idMsk = charIDToTypeID( "Msk " );
    ref1.putEnumerated( idChnl, idChnl, idMsk );
    desc2.putReference( idAt, ref1 );
    var idUsng = charIDToTypeID( "Usng" );
    var idUsrM = charIDToTypeID( "UsrM" );
    var idHdAl = charIDToTypeID( "HdAl" );
    desc2.putEnumerated( idUsng, idUsrM, idHdAl );
    executeAction( idMk, desc2, DialogModes.NO );
  } catch(e){}
  activeDocument.activeLayer = prev;
}
​
//loops through all layers in a layer set and hides them
function loopThrough(set){
  if(set instanceof LayerSet){
    var lays = set.layers;
    for(var n=0; n<lays.length; n++){
      var el = lays[n];
      switch(el.typename){
        case 'LayerSet':
          loopThrough(el);
          break;
        case 'ArtLayer':
          activeDocument.activeLayer = el;
          addMask(el);
          break;
      }
    }
  } else return null;
}
​
var refLay = activeDocument.activeLayer; //gets selected layer or folder
var dup = refLay.duplicate(); //creates a duplicate named invisible
dup.name = "invisible";
dup.opacity = 20;
dup.move(dup.parent, ElementPlacement.PLACEBEFORE);
​
if(refLay instanceof LayerSet){
  loopThrough(refLay); //if the selected thing is a folder, loop through all its layers
  dup.merge(); //and merge the "invisible" duplicate
} else {
  activeDocument.activeLayer = refLay; //if it's a good ol' layer, just hide it
  if(!activeDocument.activeLayer.isBackgroundLayer) addMask(refLay);
}
