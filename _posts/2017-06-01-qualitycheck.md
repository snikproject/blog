---
layout: post
title: Quality Check
tags: [snik, ontology, label,length]
date: 2017-04-12
use_sgvizler: true
use_sgvizler_table: true
use_jquery_ui: true
---

<div id="accordion">
<h3>Multiple Subtops</h3>
<div>
<h4>Situation</h4>
There are three immediate subclasses of meta:Top ("subtops"): Function, Role and Entity Type.
<h4>Problem</h4>
As they are disjoint, any subclass of more than one of them would be empty, which we assume to be an error and thus show here.
<h4>Solution</h4>
Automatically generate offending classes below and manually remove all but one of them.

<input type="button" id="sgvizler-button-subtop" value="List Classes with Multiple Subtops" />
<div id="sgvizler-div-subtop"
         data-sgvizler-query="
select ?class ?type1 ?type2
from <http://www.snik.eu/ontology>
{
?class meta:subTopClass ?type1, ?type2.
filter(?type1!=?type2)
filter(str(?type1)<str(?type2))
}
">
</div>
</div>

<h3>Subclass Cycles</h3>
<div>
<h4>Situation</h4>
Classes are sets of invidivuals and can be subclasses (subsets) of other classes.
<h4>Problem</h4>
Subclass cycles (A subclass of B ... subclass of A) collapse all members of the cycle to the same set, which is assumed to be unintentional.
<h4>Solution</h4>
Find subclass cycles below and and manually remove at least one of them.
Because of the limitiations of SPARQL 1.1 property paths, we cannot select the full cycle but only give all pairs of classes on a cycle.

<input type="button" id="sgvizler-button-cycle" value="List Classes with Multiple Subtops" />
<div id="sgvizler-div-cycle"
         data-sgvizler-query="
select distinct ?class ?class2
{
 owl:Class ^a ?class,?class2.
 ?class rdfs:subClassOf+ ?class2.
 ?class2 rdfs:subClassOf+ ?class.
}
">
</div>
</div>


</div>
