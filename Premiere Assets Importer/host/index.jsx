// JSX for ME Drawings Importer v1
// By Arcadi Garcia
// Has to be with the rest of the files in a valid CEP Adobe Extension folder

function test(){
  var aux = app.project.rootItem.children;
  var a = aux[1], m=2;
  while(a.type != ProjectItemType.BIN){
    a = aux[m];
    m++;
  }
  aux = a;
  res = "";
  for(var n = 0; n<aux.children.numItems; n++){
    res = res + aux.children[n].name + ' has {\n';
    var obj = aux.children[n].videoComponents;
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        res += "\t" + key + ": " + obj[key] + "\n";
      }
    }
    res += "}\n\n";
  }

  alert(res);
}

/**
 * Analyzes the Drawings folder corresponding to a
 * particular project folder and returns all the names
 * of the files inside.
 * @return {String} The info of everything in the Drawings folders,
 *                  except PSD files and the 0 folder, sorta encoded into a single string.
 *                  Files are separated by "," and attributes by "?"
 */
function analyzeDrawings(){
  var rootItem = app.project.rootItem, projFolders = rootItem.children;
  var projRef = new File(app.project.path), drawFolder = projRef.parent; //get Sources folder
  var theresDraw = drawFolder.changePath("Drawings");

  if(theresDraw && drawFolder.exists){
    var info = []; //buffer where we'll store all the info
    var files = drawFolder.getFiles();

    //sort elements to get a nice numerical order
    files.sort(function(a,b){
      //get the scene these files belong to
      auxa = parseInt(a.displayName);
      auxb = parseInt(b.displayName);

      //if both a and b are numbers, we'll just sort it
      //by integer
      if(auxa != NaN && auxb != NaN){
        if(auxa-auxb == 0){
          return (a.displayName < b.displayName) ? -1:1;
        } else return auxa-auxb;
      } else {
        //if one of them is a NaN, we'll just rely on js default ordering system
        return (a.displayName < b.displayName) ? -1:1;
      }
    });

    //loop through elements of the Drawing folder
    for(var n=0; n<files.length;n++){
      var el = files[n], kind = null, need = true, want = true;

      //skip all psd files and 0 folder
      if(el.name.indexOf(".psd") >= 0 || el.name=="0") continue;

      //if we're dealing with a folder, let's ascertain whether it's a Drawing Folder or an Assets Folder
      if(el instanceof Folder){
        //drawing process frames are named with this pattern:
        //ME XX - Drawings frame 10XX
        //so we'll go through all its files and see if we spot
        //any file containing "Drawings frame" in its name
        var isDrawing = false, subfiles = el.getFiles(); //get all files

        for(var m=0; m<subfiles.length; m++){
          var sub = subfiles[m];
          //if we spot a file with "Drawings frame" in its name,
          //we can guess this is a Drawing Process folder
          if(sub.displayName.indexOf("Drawings frame") >= 0){
            kind = "Drawing Process";
            isDrawing = true;
            break;
          }
        }
        //if we haven't found proof of el being a Drawing Process folder, we'll tag it as an Assets Folder
        kind = isDrawing ? "Drawing Process":"Assets Folder";
      } else kind = "File"; //if it's not a folder, it has to be a file

      //---------------------------------------------------------
      //NOW, LET'S CHECK IF THE ELEMENT HAS ALREADY BEEN IMPORTED
      //---------------------------------------------------------
      var scene = parseInt(el.displayName).toString(); //get scene this file belongs to
      var fold = null, found = false;

      //try to find its corresponding folder
      for(var m=0; m<projFolders.numItems; m++){
        if(scene == projFolders[m].name){
          found = true;
          fold = projFolders[m];
          break;
        }
      }
      if(fold != null && found){ //if we found a folder, let's see if it's inside
        switch(kind){
          case "Assets Folder":
            var fileName = el.displayName;
            break;
          case "Drawing Process":
          case "File":
          default:
            var fileName = el.fsName;
        }
        for(var m=0; m<fold.children.numItems; m++){
          var pathName = null;
          if(kind == "Assets Folder"){
            //if it's an assets folder, just check for folder names
            if(fold.children[m].type != ProjectItemType.BIN) continue;
            pathName = fold.children[m].name;
          } else {
            pathName = fold.children[m].getMediaPath();
            if(kind == "Drawing Process"){
              //skip individual PNGs if we're dealing w a drawing process
              if(fold.children[m].name.indexOf(".png") >= 0) continue;

              pathName = File(pathName);
              pathName = pathName.parent.fsName;
            }
          }

          if(fileName == pathName){
            need = false;
            break;
          }
        }
      }

      if(kind == "Assets Folder") want = false;

      if(need) info.push(el.name+"?"+kind+'?'+want); //add to the info array,
    }

    //Join everything into a string because we can't pass arrays or objects
    //and that's apparently that's just how the world works
    return info.join(",");
  } else return null;
}
