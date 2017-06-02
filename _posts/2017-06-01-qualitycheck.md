---
layout: post
title: Quality Check
tags: [snik, ontology, label,length]
date: 2017-04-12
use_labellanguages: true
use_sgvizler: true
use_sgvizler_table: true
---

## Multiple Subtops
### Situation
There are three immediate subclasses of meta:Top ("subtops"): Function, Role and Entity Type.
### Problem
As they are disjoint, any subclass of more than one of them would be empty, which we assume to be an error and thus show here.
### Solution
Automatically generate offending classes below and manually remove all but one of them.

<input type="button" id="sgvizler-button-subtops">List Classes with Multiple Subtops</input>
<div id="sgvizler-div-subtops"
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
