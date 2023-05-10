/**
 * [BrAPITraitSelector description]
 */


class BrAPITraitSelector {

    constructor( brapi_endpoint, svg_container, svg_file, traits_div,filtered_table, anatomy_structure, opts) {

        //declare variables
        this.brapi_endpoint = brapi_endpoint;
        this.svg_container =  svg_container;
        let entityList = [];
        var currentGFilter = null;

        //load svg in the container
        d3.xml(svg_file)
        .then(data => {
            d3.select("#" + svg_container).node().append(data.documentElement);

            d3.selectAll('g').each(function(d,i) { 
                var plant_part = this.id;

                if(anatomy_structure[this.id]){

                    var subpart = anatomy_structure[this.id];
                    for (let i = 0; i < subpart.length; i++) {
                        console.log(subpart[i]);
                        // d3.select("#" + subpart[i] ).style("opacity", 0);

                        // d3.select("#" + subpart[i] ).on("mouseover",function(d){
                        //     d3.select(this).transition()        
                        //     .duration(1000).style("opacity", 1);
                        // });
                        d3.select("#" + subpart[i] ).on("click",function(d){
                            var element = d3.select(this);
                            element.call(d3.zoom().on("zoom", function () {
                                element.attr("transform", "translate() scale(1.5 1.5)")
                              }));                   
                        });
                    }  

                    d3.select("#" +this.id ).on("click",function(d){c
                        var subpart = anatomy_structure[this.id];
                        for (let i = 0; i < subpart.length; i++) {
                            console.log(subpart[i]);
                            // d3.select("#" + subpart[i] )
                            //     .transition()        
                            //     .duration(500)
                            //     .style("opacity", 1);
                        }                        
                    });                    
                }
                
                if( plant_part.search('-brapi-zoomable') >0) { //g

                    var plant_organ = plant_part.replace('-brapi-zoomable','');
                    var plant_group = plant_part;

                    d3.select("#" + plant_group ).style("display","none");

                    d3.select("#" + plant_organ).on("mouseover",function(d){
                        d3.select("#" + plant_group ).style("display","inline");
                    });
                    
                    d3.select("#" + plant_group).on("mouseout",function(d){
                        d3.select(this).style("display","none");
                    });

                } else {
                    d3.select("#" + plant_part).on("mouseover",function(d){ console.log("iii");
                        d3.select(this).transition().style("fill", "#007DBC");
                    });
                }
            });
        });

        

        //get brapi data
        const brapi = BrAPI(brapi_endpoint, "2.0","auth");
        const traits = brapi.traits({'pageSize':50});
        

        ///get non duplicated entities
        traits.map((trait)=>{
            var entity = trait.entity;
            if(!entityList.includes(entity) && entity != ""){
                entityList.push(entity);
                return entity;
            } else{
                return;
            }
        }).map(entity=>{
            
            //load attributes by entity
            load_attributes(entity, function(d){
                        //console.log("hi");
            });
        });
        

        function load_attributes(entity){

            //Getting the attributes data
            if(!entity){
                return;
            }
            var svg_entity =  d3.select("#" + entity);
            
            if(svg_entity){

                var traitList=new Object();
                traitList[entity]=[];
                var attributesList=new Object();
                attributesList[entity]=[];

                // var attributes = brapi.search_attributes({
                var attributes = brapi.simple_brapi_call({
                        'defaultMethod': 'post',
                        'urlTemplate': '/search/attributes',
                        'params': {"traitEntities":[entity]},
                        // 'params': {"traitEntities":["fruits"]},
                });
                
                attributes.map(function(r){ 

                    var attributes = r.data;
                    attributes.forEach(attribute => {
                        attribute.trait.forEach(trait =>{
                            if(entity != trait.entity) return;
                            traitList[entity].push(attribute.attributeName);
                            attributesList[entity].push(attribute.attributeDbId);
                        });
                    });
                });


                svg_entity.on("click",function(d){
                    load_table("#" + traits_div, '#' + filtered_table, attributesList[entity], traitList[entity], function(){
                        
                        // $("#dropdown0").click();
                        // $("#dropdown0").trigger("click");
                    });               
                });

                
            }
        }

        function load_table(filterDiv, filterTable, attribute_ids, attribute_names, callback){
            // alert(":)");
            if ($.fn.dataTable.isDataTable(filterTable)) { 
                $(filterTable).DataTable().clear().destroy();
                $(filterTable).empty();                       
            };

            // var attributevalues = brapi.search_attributevalues({
            var attributevalues = brapi.simple_brapi_call({
                    'defaultMethod': 'post',
                    'urlTemplate': '/search/attributevalues',
                    // 'params': {"attributeDbIds":[153]} //attribute_ids }
                    'params': {"attributeDbIds": attribute_ids },
                    'behavior': 'fork'
            });

            // GF(attributevalues,attribute_names, filterDiv, filterTable);

            currentGFilter = GraphicalFilter(
                attributevalues,
                baseTraits,
                baseCols,
                ["Accession","Accession Id"],
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
                'Accession Id':d.germplasmDbId,
                'Accession':d.germplasmName,
                }
            }

        }

    }
}


export default function brapiTraitSelector(){
    return new BrAPITraitSelector(...arguments);
  };