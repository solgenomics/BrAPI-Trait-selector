/**
 * [BrAPITraitSelector description]
 */


class BrAPITraitSelector {

    constructor( brapi_endpoint, svg_container, svg_file, traits_div,filtered_table, svg_config, opts) {

        //declare variables
        this.brapi_endpoint = brapi_endpoint;
        this.svg_container =  svg_container;
        this.svg_config =  svg_config;
        let entityList = [];
        var currentGFilter = null;


        var svgContainer = document.getElementById(svg_container);
        var svgContent;

        // Load SVG.
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            svgContent = xhr.responseXML.documentElement;
            svgContainer.appendChild(svgContent);
            svgContent.querySelectorAll(".brapi-zoomable").forEach(function(x) {
                x.style.display = "none";
                x.style.opacity = 0;
            });

            svgContent.querySelectorAll(".brapi-entity").forEach(function(x) {

                var plant_part = x.getAttribute("name");
                var zoomable = svgContent.querySelectorAll('.brapi-zoomable[name="' + x.getAttribute("name") + '"]');
                console.log("zoomable", zoomable);

                var entity_searchable = [plant_part];

                if(svg_config[plant_part]){
                    entity_searchable = svg_config[plant_part].entities;
                } 
                
                x.addEventListener('mouseover', (e) => {
                    e.target.style.cursor="pointer";
                    
                    if(zoomable.length >0){
                        zoomable[0].style.display = "block";
                        window.setTimeout(function(){
                            zoomable[0].style.opacity = 1;
                          },1000);
                    }
                });
                x.addEventListener('mouseleave', (e) => {

                });
                x.addEventListener('click', (e) => {
                    load_attributes(plant_part, entity_searchable); 
                    if(zoomable){
                    if (e.target.closest(".brapi-zoomable")) return;
                        zoomable[0].style.display = "none";
                    }
                });
            });

            svgContent.addEventListener('click', (e) => {
                if (e.target.closest(".brapi-zoomable")) return;
                svgContent.querySelectorAll(".brapi-zoomable").forEach(function(x) {
                    x.style.display = "none";
                });
            });
        };

        xhr.open("GET", svg_file);
        xhr.responseType = "document";
        xhr.send();
        
        xhr.onerror = () => {
            console.log("Error while getting XML.");
        };     
    

        //get brapi data
        const brapi = BrAPI(brapi_endpoint, "2.0","auth");
        

        function load_attributes(entity,entitiesRelated){

            //Getting the attributes data
            if(!entity){
                return;
            }
            if(entity == "layer1") return;

            var svg_entity =  d3.select("#" + entity);
            
            if(svg_entity){

                // var attributes = brapi.search_attributes({
                var attributes = brapi.simple_brapi_call({
                        'defaultMethod': 'post',
                        'urlTemplate': '/search/attributes',
                        'params': {"traitEntities":entitiesRelated},
                        'behavior' : 'fork'
                });

                attributes.map(attribute => {
                    var traitDbIds = attribute.trait.map(trait =>{ 
                        // if(entity != trait.entity) return;
                        if(!trait.traitDbId) return;
                        return trait.traitDbId;
                    }).reduce(traitDbId =>{
                        return traitDbId !== null;
                    });
                    return traitDbIds;
                }).all(ids =>{                    
                    console.log("ax",ids);
                    load_table("#" + traits_div, '#' + filtered_table, ids);
                });                   
                
            }
        }

        function load_table(filterDiv, filterTable, attribute_ids, attribute_names, callback){

            $("#button_export").show();
            
            if ($.fn.dataTable.isDataTable(filterTable)) { 
                $(filterTable).DataTable().clear().destroy();
                $(filterTable).empty();                       
            };
            if(attribute_ids.length < 1) return;
            console.log("attribute_ids",attribute_ids.length);
            // var attributevalues = brapi.search_attributevalues({
            var attributevalues = brapi.simple_brapi_call({
                    'defaultMethod': 'post',
                    'urlTemplate': '/search/attributevalues?pageSize=100',
                    'params': {"attributeDbIds": attribute_ids                        
                    },
                    'behavior': 'fork'
            });

            currentGFilter = GraphicalFilter(
                attributevalues,
                baseTraits,
                baseCols,
                ["Accession","AccessionId"],
                undefined,
                false
            );
            currentGFilter.draw(
                filterDiv,
                filterTable,
            );

            function baseTraits(d) { 
                var traits = {}
                traits[d.attributeName] = d.value;
                return traits;
            }
            function baseCols(d){
                return {
                'AccessionId':d.germplasmDbId,
                'Accession':d.germplasmName,
                }
            }

        }

    }
}


export default function brapiTraitSelector(){
    return new BrAPITraitSelector(...arguments);
  };