---
layout: post
title: Property Validation
use_math: true
tags: [snik, ontology, validation, property, domain, range]
date: 2017-01-12
---

# Problem
Our ontology is manually created by people reading text books and extracting their facts to tables that are then converted to RDF.
To create a collective superontology, we connect all those textbook sub-ontologies to a central *meta model*. The meta model defines core classes and properties along with specifications on how to use those properties.
To make sure that the way those properties are used by the sub ontologies is consistent with the meta ontology, we want to automatically verify if they comply with the meta specifications, as there are several causes of errors:

* an extractor may misread the type or superclass of a subject or object
* an extractor may misread the domain or range of a property
* as the meta model changes, formerly correct facts have to be changed along with the new specifications
* extractors do not look at the serialized RDF of the meta model but instead as a simplified diagram of it, which may contain inconsistencies with the serialization

In this post, we investigate how to verify property usage automatically using SPARQL queries, using the following specifications:

## Domain and Range
The SNIK Ontology meta model specifies the domain and range for each of its properties.
The three major meta classes are the pairwise disjunctive `meta:Function`, `meta:Role` and `meta:EntityType`, all direct subclasses of `meta:Top`.

## Example

### meta.rdf
```
<owl:ObjectProperty rdf:about="uses">
	...
	<rdfs:domain rdf:resource="Function"/>
	<rdfs:range  rdf:resource="EntityType"/>
</owl:ObjectProperty>
```

The example means that the relation `meta:uses` *only* goes *from* a function *to* an entity type.
Generally, the assertion "$D$ is the *domain* of $p$" means that $\forall (s,p,o) \in T: s \in D$, where $T$ is the set of all triples in some triple store. Analogously, "$R$ is the *range* of $p$" means that $\forall (s,p,o) \in T: o \in R$.
In the following, we will tackle the domain exemplarily, the range is analogous.
Using the Semantic Web default open-world assumption, we can only prove that a certain resource $r$ is *not* an instance of a class $D$, if there is some class $X$ so that $r \in X$ and $X \cap D = \emptyset$. Otherwise, the open word assumption entails that we simply do not know if the fact $r \in D$ is true or not. As we do not have enough information about disjunctive classes in our ontology, and we want to know if those triples are missing *there* even if they *may* be somewhere else, we use the closed-world assumption in the following.
It will be hard to find a RDF/OWL reasoner that supports the closed-world assumption, that is applicable and performant enough on our data and that supports our specific use (more about that below), and then we would have to probably buy and learn it. Thus, we try to find a custom solution here.
Indeed, we can easily formulate a naive SPARQL 1.1 query that finds triples violating a property's domain:

### Naive Domain Verification Query
```
select ?s ?p ?o ?domain
{
 ?p rdfs:domain ?domain.
 ?s ?p ?o.
 filter not exists {?s a ?domain.}
}
```
Executing this query on the [SNIK SPARQL Endpoint](http://www.snik.eu/sparql) leads to [strange results](http://www.snik.eu/sparql/?default-graph-uri=&query=select+%3Fs+%3Fp+%3Fo+%3Fdomain%0D%0A%7B%0D%0A+%3Fp+rdfs%3Adomain+%3Fdomain.%0D%0A+%3Fs+%3Fp+%3Fo.%0D%0A+filter+not+exists+%7B%3Fs+a+%3Fdomain.%7D%0D%0A%7D%0D%0A), however, such as:

| s                   | p          | o               							| domain        |
|---------------------|------------|-----------------|---------------|
| rdfs:subPropertyOf | rdfs:label | "subPropertyOf" 						| rdfs:Resource |

These results contain multiple elements that we don't want to have:

### Problems
1. The triple belongs to the default graph of the SPARQL endpoint and not to our own ontology.
2. The domain is `rdfs:Resource`, which is almost never explicitly declared as "All things described by RDF are called resources, and are instances of the class rdfs:Resource." ([source](https://www.w3.org/TR/rdf-schema/#ch_resource)).

We avoid problem 1 by restricting the graph to `http://www.snik.eu/ontology`.
We can solve problem 2 in our case by inferring implicit class membership through subclass hierarchy using SPARQL 1.1 property paths, as all our classes have a subclass path to `meta:Top`, which is the topmost concept used in our domain and range statements. This leads to:

##### Query 1
```
select ?s ?p ?o ?domain
FROM <http://www.snik.eu/ontology>
{
 ?p rdfs:domain ?domain.
 ?s ?p ?o.
 filter not exists {?s a/rdfs:subClassOf* ?domain.}
}
```

However, our new error-detecting query falsely reports seemingly correct results such as those:

| s                   												| p 								|o               														| domain        |
|---------------------|------------|-----------------|---------------|
|meta:EntityType 	|meta:isBasedOn 	|meta:EntityType 	|meta:EntityType |
|meta:Role |	meta:isInvolvedIn 	| meta:Function 	|meta:Role |

The subject of the triple and the domain are exactly the same, why are they incorrect?
First, these triples are the actual definitions of the domain statement, they should not even be selected by the first two triple patterns. They are what we call [virtual triples](#virtual) from the graph `http://www.snik.eu/ontology/virtual`, which are used to visually connect the domain and range of a property in the [SNIK Graph](http://www.snik.eu/graph) visualization. And second, this shows a common misconception and conceptual problem with the SNIK ontology: domain and range are only concernced with the *instances* of classes, the properties are not supposed to be used between classes themselves! This is problematic because normally there are only two abstraction levels: the schema and the instance level. But the sub ontologies of the meta model are ontologies of classes themselves, that should be usable by a third level of actual instances of concrete hospitals. Thus, when we can correct the query, we get only a single result, which is an actual modelling error and may be already corrected [when you execute the query](http://www.snik.eu/sparql/?default-graph-uri=&query=select+%3Fs+%3Fp+%3Fo+%3Fdomain%0D%0AFROM+<http%3A%2F%2Fwww.snik.eu%2Fontology%2Fbb>%0D%0AFROM+<http%3A%2F%2Fwww.snik.eu%2Fontology%2Fob>%0D%0AFROM+<http%3A%2F%2Fwww.snik.eu%2Fontology%2Fmeta>%0D%0A%7B%0D%0A+%3Fp+rdfs%3Adomain+%3Fdomain.%0D%0A+%3Fs+%3Fp+%3Fo.%0D%0A+filter+not+exists+%7B%3Fs+rdfs%3AsubClassOf*%2Fa+%3Fdomain.}%0D%0A}%0D%0A)):

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

So we now have a correct query that is unfortunately not very useful at the moment. Thus we [stash it away for the future](https://gist.github.com/KonradHoeffner/235ba45963f6d1ed87dc4554807fc73a) ([similarily for the range](https://gist.github.com/KonradHoeffner/01ac5faa4bf1abe572c480d7f7692924)) and look for a query that validates the data that is actually there right now.
As the sub ontologies are full of information about those properties, where do we find it?

The property `meta:uses`, domain `meta:Function` and range `meta:EntityType`.
The blue book states that the hospital management *uses* a business strategy, so the most intuitive way to represent that fact as an RDF triple is:

`bb:HospitalManagement meta:uses bb:BusinessStrategy.`

As written above however, we cannot state that fact this way because both subject and object of that triple are not *instances* but *subclasses* of `meta:Function`, respectively `meta:EntityType`.

#### Excercise

##### Question: Can we add more domain and range statements like this?

```
meta:uses rdfs:domain bb:HospitalManagement
meta:uses rdfs:range bb:BusinessStrategy.
```

###### Answer
No, because this would mean (as always for domain, range is analogous) that all subjects of `meta:uses` are *both* instances of `meta:Function` *and* `bb:HospitalManagement`.
Thus, the effective domain would become the intersection of them, which is equal to `bb:HospitalManagement` as it is a subclass of `meta:Function`.
But we want to restrict `meta:uses` not in the general case but *only* when the subject is of type `bb:HospitalManagement`.
We could solve this by creating a subproperty of `meta:uses`, let's say `bb:HospitalManagementUses`, and state domain and range for *that*, but we would need to add [1111 new properties](http://www.snik.eu/sparql?default-graph-uri=http%3A%2F%2Fwww.snik.eu%2Fontology&query=select+count(%3Fs)%0D%0A%7B%0D%0A+%3Fs+owl%3AonProperty+meta%3Auses.%0D%0A}) for `meta:uses` alone.
This approach may be feasible on smaller ontologies, however; we investigate it for the upcoming [IT4IT](http://www.opengroup.org/IT4IT) ontology.

Also, upon closer inspection, the book means "each hospital management uses *a* business strategy" (there is at least one), for which we need a different formalism:

### OWL Restrictions

OWL restrictions are logical statements about each instance of a class.

|OWL restriction| Protegé Description of X|Logic|
|---------------------|---------------------|------------|
|owl:someValuesFrom Y|P some Y|$\forall x \in X: \exists y \in Y: (x,y) \in P$|
|owl:allValuesFrom  Y|P all  Y|$\forall x \in X: \forall y: (x,y) \in P \rightarrow y \in Y$|

Others: `owl:hasValue`, `owl:cardinality`, `owl:minCardinality`, `owl:maxCardinality` ([more information](http://www.cs.vu.nl/~guus/public/owl-restrictions/))

OWL restrictions are convoluted and hard to visualize, but we don't have an alternative here.
This exemplifies an inherent problem of RDF, which cannot directly represent ternary and higher relationships and needs this kind of helper structure to express them.

Protegé does its best to sweep this problem under the carpet:
![](http://protegewiki.stanford.edu/images/6/63/Alr-matrix-classes.png)

The full ugliness of our example case in an RDF/XML snippet using blanknodes:

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

Note that this means that each instance of hospital management is not prevented from *using* more than one, or something else in addition to a business strategy.

<a name="virtual"></a>
In order to hide this in our [visualization](http://www.snik.eu/graph), we added "virtual triples" like `bb:HospitalManagement meta:uses bb:BusinessStrategy` so that the nodes are directly connected with the relation but for the verification we need to query the original OWL restrictions.

Note that at the moment, `owl:someValuesFrom` are used in all 657 restrictions.
I suspect this often differs from what the extractors actually wanted to express and that `owl:someValuesFrom` is the only way connections between classes were translated by our old conversion tool, so that we can never recover the original intent of the extractors. We should make allowances for that in our new ontologies, however, and provide our extractors with all possibile restrictions.

But, to come back to our verification problem, the question now becomes "Is it actually possible to fulfill this restriction?", again under closed-world assumption.
We thus need to check whether the class that contains the restriction (technically, that is a superclass of it) is equal to or a subclass of the domain of the property.

```
select distinct(?s)
FROM <http://www.snik.eu/ontology/meta>
FROM <http://www.snik.eu/ontology/bb>
FROM <http://www.snik.eu/ontology/ob>
{
 graph <http://www.snik.eu/ontology/meta> {?p rdfs:domain ?domain.}

 ?s a owl:Class.

 ?s rdfs:subClassOf ?superClass.
 filter not exists {?superClass a owl:Restriction.}

 ?s rdfs:subClassOf ?r.
 ?r a owl:Restriction.
 ?r owl:someValuesFrom ?o.
 ?r owl:onProperty ?p.

 filter not exists {?s rdfs:subClassOf+ ?domain.}
} order by ?s
```

The simultaneus presence of the SPARQL 1.1 features of property paths and negation seemed to triggered some bug and finally crashed our SPARQL endpoint. A server restart later, the query still gives nonsensical results, so I had to do a workaround:

 1. remove "filter not exists {?s rdfs:subClassOf+ ?domain.}", save result as TSV in "all"
 2. remove "filter not exists {} " but leave the inner triple patterns, save result as TSV in "correct"
 3. remove first line and quotation marks from both files and run "comm -23 all correct > incorrect"

Many of the errors were eliminated by deleting and reuploading the `ob` graph, that likely still contained some leftovers from previous versions, so that finally 80 inconsistent domains were found. However this method also has to be applied to the `rdfs:range` and in the future for new ontologies so that I settled a this monster of a workaround-SPARQL-query. I'm not proud of it but with [98 results](http://www.snik.eu/sparql?default-graph-uri=&query=select+distinct(%3Fs)%0D%0AFROM+<http%3A%2F%2Fwww.snik.eu%2Fontology%2Fmeta>%0D%0AFROM+<http%3A%2F%2Fwww.snik.eu%2Fontology%2Fbb>%0D%0AFROM+<http%3A%2F%2Fwww.snik.eu%2Fontology%2Fob>%0D%0A%7B%0D%0A+graph+<http%3A%2F%2Fwww.snik.eu%2Fontology%2Fmeta>+%7B%3Fp+a+owl%3AObjectProperty.}%0D%0A+%3Fp+rdfs%3Adomain+%3Fdomain.%0D%0A%0D%0A+%3Fs+a+owl%3AClass.%0D%0A%0D%0A+%3Fs+rdfs%3AsubClassOf+%3FsuperClass.%0D%0A+filter+not+exists+%7B%3FsuperClass+a+owl%3ARestriction.}%0D%0A%0D%0A+%3Fs+rdfs%3AsubClassOf+%3Fr.%0D%0A+%3Fr+a+owl%3ARestriction.%0D%0A+%3Fr+owl%3AsomeValuesFrom+%3Fo.%0D%0A+%3Fr+owl%3AonProperty+%3Fp.%0D%0A%0D%0A+filter(%3Fs!%3D%3Fdomain)%0D%0A+MINUS+%7B%3Fs+rdfs%3AsubClassOf+%3Fdomain.}%0D%0A+MINUS+%7B%3Fs+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+%3Fdomain].}%0D%0A+MINUS+%7B%3Fs+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+%3Fdomain]].}%0D%0A+MINUS+%7B%3Fs+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+%3Fdomain]]].}%0D%0A+MINUS+%7B%3Fs+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+%3Fdomain]]]].}%0D%0A+MINUS+%7B%3Fs+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf%3Fdomain]]]]].}%0D%0A+MINUS+%7B%3Fs+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+%3Fdomain]]]]]].}%0D%0A}) it is reasonably close to correct to be used for manual checking and I don't have the time to do Virtuoso (07.20.3217) bugfixing. I tried to create a minimal working example to ask for help from the Virtuoso developers but as soon as I removed something from the query, the problem did not occur anymore.

Anyways, here is the final query for the domain (also [online](https://gist.github.com/KonradHoeffner/d208a262806a3a080650494c90382589)):

```
select distinct(?s) ?domain
FROM <http://www.snik.eu/ontology/meta>
FROM <http://www.snik.eu/ontology/bb>
FROM <http://www.snik.eu/ontology/ob>
{
 graph <http://www.snik.eu/ontology/meta> {?p a owl:ObjectProperty.}
 ?p rdfs:domain ?domain.

 ?s a owl:Class.

 ?s rdfs:subClassOf ?superClass.
 filter not exists {?superClass a owl:Restriction.}

 ?s rdfs:subClassOf ?r.
 ?r a owl:Restriction.
 ?r owl:someValuesFrom ?o.
 ?r owl:onProperty ?p.

 filter(?s!=?domain)
 MINUS {?s rdfs:subClassOf ?domain.}
 MINUS {?s rdfs:subClassOf [ rdfs:subClassOf ?domain].}
 MINUS {?s rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf ?domain]].}
 MINUS {?s rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf ?domain]]].}
 MINUS {?s rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf ?domain]]]].}
 MINUS {?s rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf?domain]]]]].}
 MINUS {?s rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf ?domain]]]]]].}
}
```

And for the range ( [results](http://www.snik.eu/sparql?default-graph-uri=&query=select+distinct(%3Fs)+%3Frange%0D%0AFROM+<http%3A%2F%2Fwww.snik.eu%2Fontology%2Fmeta>%0D%0AFROM+<http%3A%2F%2Fwww.snik.eu%2Fontology%2Fbb>%0D%0AFROM+<http%3A%2F%2Fwww.snik.eu%2Fontology%2Fob>%0D%0A%7B%0D%0A+graph+<http%3A%2F%2Fwww.snik.eu%2Fontology%2Fmeta>+%7B%3Fp+a+owl%3AObjectProperty.}%0D%0A+%3Fp+rdfs%3Arange+%3Frange.%0D%0A%0D%0A+%3Fs+a+owl%3AClass.%0D%0A%0D%0A+%3Fs+rdfs%3AsubClassOf+%3FsuperClass.%0D%0A+filter+not+exists+%7B%3FsuperClass+a+owl%3ARestriction.}%0D%0A%0D%0A+%3Fs+rdfs%3AsubClassOf+%3Fr.%0D%0A+%3Fr+a+owl%3ARestriction.%0D%0A+%3Fr+owl%3AsomeValuesFrom+%3Fo.%0D%0A+%3Fr+owl%3AonProperty+%3Fp.%0D%0A%0D%0A+filter(%3Fo!%3D%3Frange)%0D%0A+MINUS+%7B%3Fo+rdfs%3AsubClassOf+%3Frange.}%0D%0A+MINUS+%7B%3Fo+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+%3Frange].}%0D%0A+MINUS+%7B%3Fo+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+%3Frange]].}%0D%0A+MINUS+%7B%3Fo+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+%3Frange]]].}%0D%0A+MINUS+%7B%3Fo+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+%3Frange]]]].}%0D%0A+MINUS+%7B%3Fo+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf%3Frange]]]]].}%0D%0A+MINUS+%7B%3Fo+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+[+rdfs%3AsubClassOf+%3Frange]]]]]].}%0D%0A}), also [online](https://gist.github.com/KonradHoeffner/d9638183fc5fe00746aad137829b31fe)):

```
select distinct(?s) ?range
FROM <http://www.snik.eu/ontology/meta>
FROM <http://www.snik.eu/ontology/bb>
FROM <http://www.snik.eu/ontology/ob>
{
 graph <http://www.snik.eu/ontology/meta> {?p a owl:ObjectProperty.}
 ?p rdfs:range ?range.

 ?s a owl:Class.

 ?s rdfs:subClassOf ?superClass.
 filter not exists {?superClass a owl:Restriction.}

 ?s rdfs:subClassOf ?r.
 ?r a owl:Restriction.
 ?r owl:someValuesFrom ?o.
 ?r owl:onProperty ?p.

 filter(?o!=?range)
 MINUS {?o rdfs:subClassOf ?range.}
 MINUS {?o rdfs:subClassOf [ rdfs:subClassOf ?range].}
 MINUS {?o rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf ?range]].}
 MINUS {?o rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf ?range]]].}
 MINUS {?o rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf ?range]]]].}
 MINUS {?o rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf?range]]]]].}
 MINUS {?o rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf [ rdfs:subClassOf ?range]]]]]].}
}
```
