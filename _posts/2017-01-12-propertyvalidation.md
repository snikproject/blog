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

The assertion "$D$ is the *domain* of $p$" means that $\forall (s,p,o) \in T: s \in D$, where $T$ is the set of all triples in some triple store. Analogously, "$R$ is the *range* of $p$" means that $\forall (s,p,o) \in T: o \in R$.
In the following, we will tackle the domain exemplarily, the range is analogous.
Using the Semantic Web default open-world assumption, we can only prove that a certain resource $r$ is *not* an instance of a class $D$, if there is some class $X$ so that $r \in X$ and $X \cap D = \emptyset$. Otherwise, the open word assumption entails that we simply do not know if the fact $r \in D$ is true or not. As we do not have enough disjunctive information in our ontology, and we want to know if those triples are missing *there* even if they *may* be somewhere else, we use the closed-world assumption in the following.
Now we can formulate a naive SPARQL 1.1 query that finds triples violating a property's domain:

### Naive Domain Verification Query
```
select ?s ?p ?o ?domain
{
 ?p rdfs:domain ?domain.
 ?s ?p ?o.
 filter not exists {?s a ?domain.}
}
```
Executing this query on the [SNIK SPARQL Endpoint](http://www.snik.eu/sparql) leads to [strange results](http://www.snik.eu/sparql?default-graph-uri=&query=select+%3Fs+%3Fp+%3Fo+%3Fdomain%0D%0A{%0D%0A+%3Fp+rdfs%3Adomain+%3Fdomain.%0D%0A+%3Fs+%3Fp+%3Fo.%0D%0A+filter+not+exists+{%3Fs+a+%3Fdomain.}%0D%0A}), however, such as:

| s                   | p          | o               							| domain        |
|---------------------|------------|-----------------|---------------|
| rdfs:subPropertyOf | rdfs:label | "subPropertyOf" 						| rdfs:Resource |

These results contain multiple elements that we don't want to have in our query:

### Problems
1. The triple belongs to the default graph of the SPARQL endpoint and not to our own ontology.
2. The domain is `rdfs:Resource`, which is almost never explicitly declared as "All things described by RDF are called resources, and are instances of the class rdfs:Resource." [(source)](https://www.w3.org/TR/rdf-schema/#ch_resource)

We avoid problem 1 by restricting the graph to `http://www.snik.eu/ontology`.
We can solve problem 2 in our case by inferring implicit class membership through subclass hierarchy using SPARQL 1.1 property paths, as all our classes have a subclass path to `meta:Top`, which is the topmost concept used in our domain and range statements. This leads to:

```
select ?s ?p ?o ?domain
FROM <http://www.snik.eu/ontology>
{
 ?p rdfs:domain ?domain.
 ?s ?p ?o.
 filter not exists {?s a/rdfs:subClassOf* ?domain.}
}
```

Now, the results include those incorrect ones:

| s                   												| p 								|o               														| domain        |
|---------------------|------------|-----------------|---------------|
|meta:EntityType 	|meta:isBasedOn 	|meta:EntityType 	|meta:EntityType |
|meta:Role |	meta:isInvolvedIn 	| meta:Function 	|meta:Role |

The subject of the triple and the domain are exactly the same, why are they incorrect?
First, these triples are the actual definitions of the domain statement, they should not even be selected by the first two triple patterns. They are what we call *virtual triples* from the graph `http://www.snik.eu/ontology/virtual`, which are used to visually connect the domain and range of a property in the [SNIK Graph](http://www.snik.eu/graph) visualization. And second, this shows a common misconception and conceptual problem with the SNIK ontology: domain and range are only concernced with the *instances* of classes, the properties are not supposed to be used between classes themselves! This is problematic because normally there are only two abstraction levels: the schema and the instance level. But the sub ontologies of the meta model are ontologies of classes themselves, that should be usable by a third level of actual instances of concrete hospitals. Thus, when we can correct the query, we get only a single result, which is an actual modelling error and may be already corrected [when you execute the query](www.snik.eu/sparql?default-graph-uri=&query=select+%3Fs+%3Fp+%3Fo+%3Fdomain%0D%0AFROM+<http%3A%2F%2Fwww.snik.eu%2Fontology%2Fbb>%0D%0AFROM+<http%3A%2F%2Fwww.snik.eu%2Fontology%2Fob>%0D%0AFROM+<http%3A%2F%2Fwww.snik.eu%2Fontology%2Fmeta>%0D%0A{%0D%0A+%3Fp+rdfs%3Adomain+%3Fdomain.+%0D%0A+%3Fs+%3Fp+%3Fo.%0D%0A+filter+not+exists+{%3Fs+rdfs%3AsubClassOf*%2Fa+%3Fdomain.}%0D%0A}&should-sponge=&format=text%2Fhtml)):

```
select ?s ?p ?o ?domain
FROM <http://www.snik.eu/ontology/bb>
FROM <http://www.snik.eu/ontology/ob>
FROM <http://www.snik.eu/ontology/meta>
{
 ?p rdfs:domain ?domain.
 ?s ?p ?o.
 filter not exists {?s rdfs:subClassOf*/a ?domain.}
}
```

Now while this query may be useful for the future, if actual instance data will be available, for now we want to validate the data that is actually there. As the sub ontologies are full of information about those properties, where do we find it?

Take for example the property `meta:uses`, which has domain `meta:Function` and range `meta:EntityType`.
The blue book states that the hospital management *uses* a business strategy, so the most intuitive way to represent that fact as an RDF triple is:

`bb:HospitalManagement meta:uses bb:BusinessStrategy.`

As written above however, we cannot state that fact this way because both subject and object of that triple are not *instances* but *subclasses* of `meta:Function` respectively `meta:EntityType`.
Also, upon closer inspection, the book means "each hospital management uses *a* business strategy", which can be and is generally formulated in our subontologies as follows:

### OWL Restrictions
```
<owl:Class rdf:about="HospitalManagement">
    <rdfs:subClassOf rdf:resource="&meta;Management"/>
    <rdfs:subClassOf>
        <owl:Restriction>
            <owl:onProperty rdf:resource="&meta;uses"/>
            <owl:someValuesFrom rdf:resource="BusinessStrategy"/>
        </owl:Restriction>
    </rdfs:subClassOf>
...
</owl:Class>
```

 When I joined the project I first wanted to get rid of the OWL restrictions as they are convoluted, hard to visualize and I suspect often differ in semantics from what the extractors actually wanted to express, as `owl:someValuesFrom` is almost exclusively used (I guess it was the only way connections between classes were translated by our old Excel2OWL tool, so that we cannot recover the original intent of the extractors).

 Unfortunately, in this 3-layer constellation, this modelling method unfortunately seems necessary.
 This also lead to the compromise of the virtual triples for the visualization, which I worry often hides the actual problem underneath.

The verification question now becomes "Is it actually possible to fulfill this restriction?", again under closed-world assumption.
We thus need to check whether the class that contains the restriction (technically, that is a superclass of it) is equal to or a subclass of the domain of the property.

```
select *
FROM <http://www.snik.eu/ontology/meta>
FROM <http://www.snik.eu/ontology/bb>
FROM <http://www.snik.eu/ontology/ob>
{
 graph <http://www.snik.eu/ontology/meta> {?p rdfs:domain ?domain.}

 ?s a owl:Class.

 ?s rdfs:subClassOf ?superClass.
 filter not exists {?superClass a owl:Restriction.}
 ?s meta:subTopClass ?subTop.

 ?s rdfs:subClassOf ?r.
 ?r a owl:Restriction.
 ?r owl:onProperty ?p.

 filter not exists {?s rdfs:subClassOf* ?domain.}
}
```

Unfortunately, the simultaneus presence of the SPARQL 1.1 features of property paths and negation (which may have a problematic computational complexity) seemed to have lead to subtly wrong results and finally crashed our SPARQL endpoint.
