AFRAME.registerComponent("createmodels", {
    init: async function(){
        // getting the model details
        var modelDetails = await this.getModels();
        
        // fetching the keys of the model details
        var details = Object.keys(modelDetails);
        details.map(detail => {
            var model = modelDetails[detail];

            // calling createModels() function
            this.createModels(model)
        });
    },
    getModels: async function(){
        return fetch("model.json")
            .then(res => res.json())
            .then(data => data);
    },
    createModels: function(model){
        var barcodeValue = model.barcode_value;
        var modelUrl = model.model_url;
        var modelName = model.model_name;

        //getting the scene
        var scene = document.querySelector("a-scene");

        // creating the barcode marker element
        var marker = document.createElement("a-marker");
        marker.setAttribute("id", `marker-${modelName}`);
        marker.setAttribute("type", "barcode");
        marker.setAttribute("model_name", modelName);
        marker.setAttribute("value", barcodeValue);
        marker.setAttribute("markerhandler", {});
        scene.appendChild(marker);

        //checking if it's the base (check model.json)
        if(barcodeValue === 0){
            var modelEl = document.createElement("a-entity");
            modelEl.setAttribute("id", `${modelName}`);
            modelEl.setAttribute("geometry", {
                primitive: "box",
                width: model.width,
                height: model.height
            });
            modelEl.setAttribute("position", model.position);
            modelEl.setAttribute("rotation", model.rotation);
            modelEl.setAttribute("material", { color: model.color });
            marker.appendChild(modelEl);
        }
        else{
            var modelEl = document.createElement("a-entity");
            modelEl.setAttribute("id", `${modelName}`);
            modelEl.setAttribute("gltf-model", `url(${modelUrl})`);
            modelEl.setAttribute("scale", model.scale);
            modelEl.setAttribute("position", model.position);
            modelEl.setAttribute("rotation", model.rotation);
            marker.appendChild(modelEl);
        }
    }
});