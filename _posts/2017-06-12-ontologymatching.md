---
layout: post
use_math: true 
include_ontologymatching: true 
title: DRAFT Ontology Matching 
tags: [snik, ontology matching, ontology]
date: 2017-06-12
---

# Abstract
We evaluate the book [Ontology Matching by J. Euzenat and P. Shvaiko](http://www.springer.com/de/book/9783642387203) on the SNIK ontology, to determine, which methods and strategies are applicable to match the SNIK subontologies with each other. 

# Introduction
The SNIK subontologies represent the different perspectives on hospital information systems of their source textbooks.
By comparing the subontologies, we can  answer the question, which concepts have the same and which have a different meaning.
This question is the core of the research area of *Ontology Matching*, which is summarized by the eponymous [book by Jérôme Euzenat and Pavel Shvaiko (Second Edition, 2013, non-free)](http://www.springer.com/de/book/9783642387203).
In the following, we use chapter 5 of that book to present the different matching strategies and methods and analyze their viability with SNIK.
All the definitions and quotes in this post are taken from that book.
For an applied example, please see our [previous post](2017/01/13/limes/), where we used [LIMES](http://aksw.org/Projects/LIMES.html) to find link candidates using string-based methods.

# Basic Similarity Measures

The basic idea of ontology matching is to pair-wisely compare ontology entities.
We only compare classes, because SNIK has few relations and almost no instances.
To determine, whether a pair of classes is a match, measures of similarity can be used along with a threshold.
Formally, for a similarity function $\sigma : o \times o \rightarrow \mathbb{R}$:

$\forall x,y \in o: \sigma(x,y) \geq 0$ (positiveness)

$\forall x,y,z \in o: \sigma(x,x) \geq \sigma(y,z)$ (maximality)

$\forall x,y \in o: \sigma(x,y) = \sigma(y,x)$ (symmetry)

To compare of different pairs with each other and to apply a threshold, similarity functions are *normalized*, that is, mapped to the unit interval of real numbers [0,1].

## Name-Based Techniques
Name-based techniques assume that concepts with similar meaning, and only those, have the same or a similar name, label or other textual description (in our case the definition).
This assumption is often untrue do to synonyms (same meaning, different name) and homonyms (same name, different meaning).
Synomyns reduce the recall, that is they reduce the number of correct mappings that are found.
Hyponyms reduce the precision, that is they reduce the number of found mappings that are correct, so that there are more false positives. 
Still, in many cases, name-based techniques work, so that they are a useful tool for finding candidates that are then manually validated to increase precision.

### String-Based Methods
String-based methods compare the sequence of letters of two entities.

#### Edit Distances
Edit distances are covered by the [LIMES](http://aksw.org/Projects/LIMES.html) tool, which was successfully applied to all SNIK subontologies, see our [previous post](2017/01/13/limes/).
The synonym problem is less severe in our case because SNIK classes are annotated with synonyms from their books.
However some classes are only labelled in English, others only in German, which often prevents LIMES from finding matches.

##### Token-Based Distances
Token-based distances treat a string as a multiset of words and are only useful for long texts.
<!--, so at SNIK we can only apply them on definitions, or only on the [longest labels](http://127.0.0.1:4000/2017/04/12/dashboard/#label-length).-->

###### TFIDF
One of the most common measures is "TFIDF, which is used for scoring the relevance of a document, i.e., a bag of words, to a term by taking in to account the frequency of appearance of the term in the corpus."
Its advantage is that it filters out noise from stopwords and benefits rarely used words.
It can be appled to SNIK definitions using the set of all
[definitions](http://www.snik.eu/sparql?default-graph-uri=&query=select+group_concat%28str%28%3Flabel%29%3B+separator%3D%22+%22%29+from+%3Chttp%3A%2F%2Fwww.snik.eu%2Fontology%3E+%7B%3Fclass+a+owl%3AClass.%3Fclass+skos%3Adefinition+%3Flabel.%7D&should-sponge=&format=text%2Fhtml&timeout=0&debug=on)
and
[labels](http://www.snik.eu/sparql?default-graph-uri=&query=select+group_concat%28str%28%3Flabel%29%3B+separator%3D%22+%22%29+from+%3Chttp%3A%2F%2Fwww.snik.eu%2Fontology%3E+%7B%3Fclass+a+owl%3AClass.%3Fclass+rdfs%3Alabel%7Cskos%3AaltLabel+%3Flabel.%7D&should-sponge=&format=text%2Fhtml)
 as corpus.

#### Path Comparison
The path comparison is the first approach discussed here that uses the structure of the ontology, not just the attributes of a single class.
For a class, its complete subclass hierarchy is converted to a string, for example by concatenating the labels.
For a pair of classes, their subclass strings are compared using:


$$\delta({\langle s_i \rangle}^n_{i=1}, {\langle s_j' \rangle}^m_{j=1})= \lambda \times \delta'(s_n,s'_m)+(1-\lambda) \times \delta({\langle s_i \rangle}_{i=1}^{n-1}, {\langle s'_j \rangle}_{j=1}^{m-1})$$

such that

$$\delta(\langle \rangle, {\langle s'_j \rangle}_{j=1}^{k})=\delta({\langle s_i \rangle}_{i=1}^k)=k$$

Where $\delta$ is any other string- or language-based distance and $\lambda$ is a penalty in $(0,1)$.

##### Example

Let's compare `bb:Ceo` to `ciox:ChiefExecutiveOfficer` with $\lambda = 0.7$ and $\delta'$ as the Levenshtein distance.
The subclass paths are<sup name="a1"><a href="#f1">1</a></sup>:

<div id="pathcomparison-bb-ceo" style="float:left;"> </div>
<div id="pathcomparison-ciox-ceo" style="float:left;"> </div>
<p style="clear:left;"/>

meta:Top has two subclass paths so we would calculate both and chose the higher score. However we can already see that the left path is more similar so we only show that one here.

$$ s = $$[Top, Role, HIS Stakeholder, Hospital Staff, CEO]
$$ s' = $$[Top, Role, HIS Stakeholder, CEO]
$$ \delta()$$ 


### Language-Based Methods
Language-based methods see strings as sequences of words, not characters.
As such they rely on natural language processing (NLP) tools.

## Further Reading
* [State of the Art on Ontology Alignment, Vargas-Vera et al. 2015, (paywall)](http://dl.acm.org/citation.cfm?id=2807068).

<b id="f1">1</b> Shown as a tree, so some classes occur multiple times. [↩](#a1)
