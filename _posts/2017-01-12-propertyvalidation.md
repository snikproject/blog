---
layout: post
title: SNIK Ontology Property Validation
use_math: true
tags: [snik, ontology, validation, property, domain, range]
---

# Problem
Our ontology is manually created by people reading text books and extracting their facts to tables that are then converted to RDF.
To create a collective superontology, we connect all those textbook sub-ontologies to a central *meta model*. The meta model defines core classes and properties along with specifications on how to use those properties.
To make sure that our sub ontologies are consistent with the meta ontology, we want to automatically verify if they comply with the meta specifications, as there are several causes of errors:

* an extractor may misread the type or superclass of a subject or object
* an extractor may misread the domain or range of a property
* as the meta model changes, formerly correct facts have to be changed along with the new specifications
* extractors do not look at the serialized RDF of the meta model but instead as a simplified diagram of it, which may contain inconsistencies with the serialization

In this post, we want to verify properties specifically, with the following restrictions:

## Domain and Range
The SNIK Ontology meta model specifies the domain and range for each of its properties.
The three major meta classes are the pairwise disjunctive `meta:Function`, `meta:Role` and `meta:EntityType`, all direct subclasses of `meta:Top`.

## Example
### meta.rdf
```
<owl:ObjectProperty rdf:about="updates">
	...
	<rdfs:domain rdf:resource="Function"/>
	<rdfs:range  rdf:resource="EntityType"/>
</owl:ObjectProperty>
```

The assertion "$D$ is the *domain* of $p$" means that $\forall (s,p,o) \in T: s \in D$, where $(s,p,o)$ are the triples in our triple store $T$. Analogously, "$R$ is the *range* of $p$" means that $\forall (s,p,o) \in T: o \in R$.

This can be directly translated to a SPARQL 1.1 query that finds triples violating a property's domain:

### Naive Domain Verification Query
```
select ?s ?p ?o ?domain
{
 ?p rdfs:domain ?domain.
 ?s ?p ?o.
 filter not exists {?s a ?domain.}
}
```


#### Problems
* virtual triples in the graph http://www.snik.eu/ontology/virtual
* indirect subclasses and Virtuoso
* RDF


## OWL Restrictions

The sub ontologies, such as the blue book `bb` and orange book `ob`, also add `owl:someValuesFrom` property restrictions to their own subclasses.

### bb.rdf
```
<owl:Class rdf:about="CodingOfDiagnoses">
	<rdfs:subClassOf rdf:resource="&meta;Function"/>
	<rdfs:subClassOf>
		<owl:Restriction>
    	<owl:onProperty rdf:resource="&meta;updates"/>
    	<owl:someValuesFrom rdf:resource="Diagnosis"/>
    </owl:Restriction>
	</rdfs:subClassOf>
	...
</owl:Class>
```
