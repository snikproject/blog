---
layout: post
title: Dashboard
tags: [snik, ontology, label,length]
date: 2017-04-12
use_sgvizler: true
---

## Types
Number of classes per type over all the subontologies. Hover over slices to see their absolute number.

<div id="subtops"
         data-sgvizler-query="
select replace(str(COALESCE(?subTop, 'none')),'http://www.snik.eu/ontology/meta/','meta:') count(?class)
from <http://www.snik.eu/ontology>
{
 ?class a owl:Class.
 OPTIONAL {?class meta:subTopClass ?subTop.}
}"
         data-sgvizler-chart="google.visualization.PieChart"
         style="width:100%; height:400px;">
</div>

## Ontology Size

<div id="ontologies"
         data-sgvizler-query="
select replace(str(?ontology),'http://www.snik.eu/ontology/','') count(?x)
from <http://www.snik.eu/ontology>
{
 ?ontology ov:defines ?x.
}"
   data-sgvizler-chart="google.visualization.PieChart"
   style="width:100%; height:400px;">
</div>

## Class Hierarchy

<div id="hierarchy"
       data-sgvizler-query="
select replace(str(?sub),'http://www.snik.eu/ontology/','') replace(str(sample(?super)),'http://www.snik.eu/ontology/','') count(?sub)

from <http://www.snik.eu/ontology/meta>
from <http://www.snik.eu/ontology/ob>
from <http://www.snik.eu/ontology/bb>
from <http://www.snik.eu/ontology/he>
{
?sub a owl:Class.
# some classes are missing superclasses, they would confuse the algorithm
filter(bound(?super)||?sub=meta:Top)
OPTIONAL
{
?sub rdfs:subClassOf ?super.
?super a owl:Class.
}
}"
       data-sgvizler-chart="google.visualization.TreeMap"
       style="width:800px; height:400px;"></div>

## Label Length

<div id="labellength"
 data-sgvizler-query="
select strlen(?l) as ?label_length count(?l) as ?number_of_labels
from <http://www.snik.eu/ontology>
{
 ?class a owl:Class.
 ?class rdfs:label ?l.
} group by strlen(?l) order by asc(strlen(?l))"
         data-sgvizler-chart="google.visualization.AreaChart"
         style="width:100%; height:400px;">
</div>
