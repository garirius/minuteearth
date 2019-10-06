// JSX for ME Drawings Importer v1
// By Arcadi Garcia
// Has to be with the rest of the files in a valid CEP Adobe Extension folder

/**
 * Gets a bin of a particular type by name. If there is more than one file
 * matching the name and type, it returns an array. If it finds none, returns null.
 * @param {String} name - The name of the element to find
 * @return {ProjectItem|Null} A ProjectItem Bin with the name in question.
 *                             If none has been found, it returns a null.
 */
 function getSceneByName(name){
   //let's inspect where's children
   var babies = app.project.rootItem.children;
   for(var n=0; n<babies.numItems; n++){
     //if we find a bin with the same name, return it and call it a day
     if(babies[n].type == ProjectItemType.BIN && babies[n].name == name) return babies[n];
   }
   return null; //if we didn't find anything, return a null
 }

/**
 * Decides which scene an element belongs in, creating a new one if necessary.
 * @param {String} name - The name of the element.
 * @return {ProjectItem} A ProjectItem bin of the scene in question.
 *                       Returns 0 Folder if none other is available.
 */
 function decideScene(name){
   var num = parseInt(name);
   if(num == NaN){ //if we weren't able to retrieve scene number, send it to 0 folder
     return getSceneByName("0");
   } else { //if we WERE able, just send it to its corresponding folder
     var fol = getSceneByName(num.toString()); //get scene folder
     if(fol == null){ //if the folder didn't exist, let's just create it
       app.project.rootItem.createBin(num.toString());
       fol = getSceneByName(num.toString());
     }
     return fol;
   }
 }


/**
 * Analyzes the Drawings folder corresponding to a
 * particular project folder and returns all the names
 * of the files inside.
 * @param {String} whatToImport - string containing the name and kind of everything we're gonna import.
 */
function updateDrawings(whatToImport){
  var rootItem = app.project.rootItem, projFolders = rootItem.children;
  var projRef = new File(app.project.path), drawFolder = projRef.parent; //get Sources folder
  var theresDraw = drawFolder.changePath("Drawings");

  if(theresDraw && drawFolder.exists){ //if we find the drawings folder
    var drawings = [], folders = []; //create separate arrays for each type

    whatToImport = whatToImport.split(","); //start to parse this string back into something usable
    for(var n=0; n<whatToImport.length; n++){
      var info = whatToImport[n].split("?"); //get an element and parse its info
      info = {name: info[0], kind: info[1]}; //...and store it in an object

      switch(info.kind){ //put the information in its corresponding array
        case "File":
          drawings.push(drawFolder.fsName + "/" + info.name); //put directly the path, since we're gonna batch-import everything
          break;
        case "Drawing Process":
        case "Assets Folder":
          folders.push(info);
          break;
      }
    }

    rootItem.createBin("AUX"); //create an aux bin to circumvent premiere's bullshit non-existent file managing capabilities
    var auxBin = getSceneByName("AUX");

    //Let's start by batch-importing all the drawings
    app.project.importFiles(drawings, false, auxBin, false);

    //Now let's move every new file to its respective bin
    while(auxBin.children.numItems > 0){ //while there's stuff in the aux bin, we'll move it
      var fol = decideScene(auxBin.children[0].name);
      auxBin.children[0].moveBin(fol);
    }

    //NOW LET'S GET WITH THE DRAWING PROCESSES AND ASSETS
    for(n=0; n<folders.length; n++){
      var assFolder = new Folder(drawFolder.fsName + "/" + folders[n].name);
      var assets = assFolder.getFiles(), paths = [], fol = decideScene(folders[n].name);
      for(var m=0; m<assets.length; m++){
        paths.push(assets[m].fsName);
      }

      app.project.importFiles(paths, false, auxBin, folders[n].kind == "Drawing Process");
      if(folders[n].kind == "Drawing Process"){ //if we were dealing with a drawing process, rename it
        //move the thing to its corresponding folder and rename it
        var refFile = auxBin.children[0];
        refFile.name = folders[n].name;
        refFile.moveBin(fol);
      } else { //if not, just move everything to its corresponding folder
        auxBin.name = folders[n].name;
        auxBin.moveBin(fol);

        rootItem.createBin("AUX"); //create an aux bin to circumvent premiere's bullshit non-existent file managing capabilities
        auxBin = getSceneByName("AUX");
      }
    }

    auxBin.deleteBin(); //after everything, just delete the friggin aux bin
    alert("Importing finished! Please click on Analyze Drawings again to refresh the list.");
  } else return null;
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
      var fold = getSceneByName(scene); //try to find its corresponding folder

      if(fold != null){ //if we found a folder, let's see if the file's inside
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
