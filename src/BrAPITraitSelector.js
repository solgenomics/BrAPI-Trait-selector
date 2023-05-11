/**
 * [BrAPITraitSelector description]
 */


class BrAPITraitSelector {

    constructor( brapi_endpoint, svg_container, svg_file, traits_div,filtered_table, svg_config, opts) {

        // const entityRelationship = svg_config.reduce((a, { SVGid, traitAttributesFrom }) => {
        //     a[SVGid] = traitAttributesFrom ;
        //     return a;
        // }, {});

        //declare variables
        this.brapi_endpoint = brapi_endpoint;
        this.svg_container =  svg_container;
        this.svg_config =  svg_config;
        let entityList = [];
        var currentGFilter = null;

        //load svg in the container
        d3.xml(svg_file)
        .then(data => {
            d3.select("#" + svg_container).node().append(data.documentElement);

            d3.selectAll('g').each(function(d,i) { 
                var plant_part = this.id;
                var entity_searchable = [this.id];
                
                if(svg_config[plant_part]){
                    entity_searchable = svg_config[plant_part].entities;
                    // d3.select("#" + plant_part ).on("click",function(d){
                        // var element = d3.select(this);
                        // load_attributes(plant_part, svg_config[plant_part].entities);
                        // element.call(d3.zoom().on("zoom", function () {
                        //     element.attr("transform", "translate() scale(1.5 1.5)")
                        //   }));                   
                    // });


                    // d3.select("#" +this.id ).on("click",function(d){c
                    //     var subpart = svg_config[this.id];
                    //     for (let i = 0; i < subpart.length; i++) {
                    //         console.log(subpart[i]);

                    //     }                        
                    // });                    
                } 

                if(plant_part){
                    d3.select("#" + plant_part ).on("click",function(d){
                        load_attributes(plant_part, entity_searchable);              
                    });
                    d3.select("#" + plant_part ).on("mouseover",function(d){
                        d3.select("#" + plant_part ).style("cursor", "pointer"); 
                    });

                    if( plant_part.search('-brapi-zoomable') >0) { //g

                        var plant_organ = plant_part.replace('-brapi-zoomable','');
                        var plant_group = plant_part;

                        d3.select("#" + plant_group ).style("display","none");

                        d3.select("#" + plant_organ).on("mouseover",function(d){
                            d3.select("#" + plant_group ).style("display","inline");
                        });
                        

                        function equalToEventTarget() {
                            return this == d3.event.target;
                        }
                        
                        d3.select("body").on("click",function(){
                            // var outside = d3.select("#" + plant_group).filter(equalToEventTarget).empty();
                            // if (outside) {
                                d3.select("#" + plant_group).style("display","none");
                            // }
                        });


                    } else {
                        d3.select("#" + plant_part).on("mouseover",function(d){ console.log("iii");
                            d3.select(this).transition().style("fill", "#007DBC");
                        });
                    }
                }
            });
        });

        

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