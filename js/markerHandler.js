// array to keep track of all marker entites visible in the scene
var modelList = [];

AFRAME.registerComponent("markerhandler", {
    init: async function(){
        // if the barcode marker is in the scene's camera view
        this.el.addEventListener("markerFound", () => {
            // getting the model name and barcode value and pushing the data into the modelList array
            var modelName = this.el.getAttribute("model_name");
            var barcodeValue = this.el.getAttribute("barcode_value");

            modelList.push({ model_name: modelName, barcode_value: barcodeValue });

            // changing model visibility
            var modelEL = document.querySelector(`#${modelName}`);
            modelEL.setAttribute("visible", true);
        });

        // if the barcode marker is not visible in the scene's camera view
        this.el.addEventListener("markerLost", () => {
            var modelName = this.el.getAttribute("element_name");

            // finding the index of the element whose marker is LOST from the scene using findIndex of the array
            var index = modelList.findIndex(x => x.model_name === modelName);
            if(index > -1){
                // removing them model from the modelList array using splice()
                modelList.splice(index, 1);
            }
        });
    },
    // tick() function to call the isModelPresentInArray() and show the final model by setting attributes
    tick: async function(){
        if(modelList.length > 1){
            var isBaseModelPresent = this.isModelPresentInArray(modelList, "base");
            var messageText = document.querySelector("#message-text");

            if(!isBaseModelPresent){
                messageText.setAttribute("visible", true);
            }
            else{
                if(models === null){
                    models = await this.getModels()
                }

                messageText.setAttribute("visible", false);
                this.placeTheModel("road", models);
                this.placeTheModel("car", models);
                this.placeTheModel("building-1", models);
                this.placeTheModel("building-2", models);
                this.placeTheModel("building-3", models);
                this.placeTheModel("sun", models);
            }
        }
    },
    getModels: async function(){
        return fetch("model.json")
        .then(res => res.json())
        .then(data => data);
    },
    // function to find the distance between two Three.js position vectors
    getDistance: function(elA, elB){
        return elA.object3D.position.distanceTo(elB.object3D.position);
    },
    // function to return a model's geometry data
    getModelGeometry: function(models, modelName){
        var barcodes = Object.keys(models);
        for(var barcode of barcodes){
            if(models[barcode].model_name === modelName){
                return {
                    position: models[barcode]["placement_position"],
                    rotation: models[barcode]["placement_rotation"],
                    scale: models[barcode]["placement_scale"],
                    model_url: models[barcode]["model_url"]
                };
            }
        }
    },
    // function to check if the model is present in the array
    isModelPresentInArray: function(arr, val){
        for(var i of arr){
            if(i.model_name === val){
                return true;
            }
        }
        return false;
    },
    placeTheModel: function(modelName, models){
        var isListContainModel = this.isModelPresentInArray(modelList, modelName);
        if(isListContainModel){
            var distance = null;
            var marker1 = document.querySelector(`#marker-base`);
            var marker2 = document.querySelector(`#marker-${modelName}`);

            distance = this.getDistance(marker1, marker2);
            if(distance < 1.25){
                // changing model visibility
                var modelEl = document.querySelector(`#${modelName}`);
                modelEl.setAttribute("visible", false);

                // checking if the model is place in the scene or not
                var isModelPlaced = document.querySelector(`#model-${modelName}`);
                if(isModelPlaced === null){
                    var el = document.createElement("a-entity");
                    var modelGeometry = this.getModelGeometry(models, modelName);
                    el.setAttribute("id", `model-${modelName}`);
                    el.setAttribute("gltf-model", `url(${modelGeometry.model_url})`);
                    el.setAttribute("position", modelGeometry.position);
                    el.setAttribute("rotation", modelGeometry.rotation);
                    el.setAttribute("scale", modelGeometry.scale);
                    marker1.appendChild(el);
                }
            }
        }
    }
});