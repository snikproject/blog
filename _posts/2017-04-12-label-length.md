---
layout: post
title: SNIK Label Length
tags: [snik, ontology, label,length]
date: 2017-04-12
use_sgvizler: true
---

<div id="example" data-sgvizler-endpoint="https://www.snik.eu/sparql"
 data-sgvizler-query="
select strlen(?l) as ?label_length count(?l) as ?number_of_labels
from <http://www.snik.eu/ontology>
{
 ?class a owl:Class.
 ?class rdfs:label ?l.
} group by strlen(?l) order by asc(strlen(?l))"
         data-sgvizler-chart="google.visualization.AreaChart"
         style="width:800px; height:400px;">
</div>
