# AWSOME // DNS

Welcome, this is the tool you where ever looking for! With AWSOME // DNS you can use AWS Route53 as your private dynamic dns service and forward your own domains to your servers at home (e.g. NAS, RaspberryPi, etc...).

## Using AWSOME // DNS

First of all you have to clone this repository (or download one of the latest releases).

### Installing dependencies

Install dependencies with:

```
npm install
```

### Run the service

To run AWSSOME // DNS just enter

```
node src/server/index.js
```

and open [http://localhost:1809](http://localhost:1809) in your favorite browser.

### Service configuration

If not already done, create an IAM user in your AWS console with full access to Route53. Enter the corresponding AccessKey and AccessSecret under settings page ([http://localhost:1809/settings](http://localhost:1809/settings)).

You can now browse to [http://localhost:1809/records](http://localhost:1809/records) and add (for each hosted zone in Route53) records which should be kept in sync with your WAN ip address.

## About the project

I created this tool for my personal use. If you have any questions or issues please do not hesitate to contact me or open an issue. I keep working on this project, if you'd like to contribute, feel free to send me a pull request.
