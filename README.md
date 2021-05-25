# MetaBatch Omic Browser

 * Rehan Akbani (owner)
 * Bradley Broom
 * John Weinstein
 * Tod Casasent (developer)

This is for educational and research purposes only.

Samples from large research projects are often processed and run in multiple batches at different times. Because the samples are processed in batches rather than all at once, the data can be vulnerable to systematic noise such as batch effects (unwanted variation between batches) and trend effects (unwanted variation over time), which can lead to misleading analysis results.

This is a project for accesing and viewing the data and analysis (particulary of Batch Effects) of large datasets in Standardized Data format.

MD Anderson Cancer Center Bioinformatics link
https://bioinformatics.mdanderson.org

MD Anderson Cancer Center MetaBatch Omic Browser link
https://bioinformatics.mdanderson.org/MOB

Java projects are Netbeans 11 projects.
R packages are RStudio projects.

### MetaBatch Omic Browser Docker Quick Start

Download the docker-compose_MOB.yml file at the root of this repository. This file is setup for use on Linux.

Make the following directories.

 - MOB/DATA
 - /MOB/indexes
 - /MOB/dsc_indexes
 - /MOB/config

 1. Copy the contents of data/testing_static/MOB/DATA into /MOB/DATA.
 2. Copy the contents of data/testing_static/MOB/INDEXES into /MOB/indexes.
 3. Copy the contents of data/testing_static/MOB/DSC_INDEXES into /MOB/dsc_indexes.
 4. Copy the contents of data/testing_static/MOB/CONFIG into /MOB/config.

Permissions or ownership of the directories may need to be changed or matched to the Docker image user 2002.

In the directory with the docker-compose.yml file run:

	docker-compose -p bephub -f docker-compose_MOB.yml up --no-build -d

You can stop it with:

	docker-compose -p bephub -f docker-compose_MOB.yml down

To connect to the MBatch Omic Browser with:

	localhost:8080/MtOB


## Links for External Libraries
Fontawesome Icons
https://fontawesome.com/icons?d=gallery&m=free

Datatables JQuery Plug-In
https://datatables.net/

**For educational and research purposes only.**

**Funding** 
This work was supported in part by U.S. National Cancer Institute (NCI) grant: Weinstein, Broom, Akbani. Computational Tools for Analysis and Visualization of Quality Control Issues in Metabolomic Data, U01CA235510

