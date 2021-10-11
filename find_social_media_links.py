import sys
import requests
from bs4 import BeautifulSoup
import re

def updateListOfLinks(links, link):
    """
    This will modify the links list in-place
    """
    href = link.get('href')
    if href[:4] == "http" and not href in links:
        links.append(href)

def getLinks(url):
    """
    Will scrape the given url, and return any social media links within
    """
    print("Fetching content from " + url)
    timeout = 5
    try:
        response = requests.get(url, timeout=timeout)
    except requests.exceptions.ReadTimeout:
        print("    timed out after {} secs".format(timeout))
        return {"facebook": "timed out", "twitter": "timed out"}
    except requests.exceptions.SSLError:
        return {"facebook": "SSL error", "twitter": "SSL error"}
    soup = BeautifulSoup(response.content, 'html.parser')
    facebookLinks = []
    for link in soup.find_all(href=re.compile("facebook")):
        updateListOfLinks(facebookLinks, link)

    twitterLinks = []
    for link in soup.find_all(href=re.compile("twitter")):
        updateListOfLinks(twitterLinks, link)

    if len(facebookLinks) == 1 and len(twitterLinks) == 1:
        return {"facebook": facebookLinks[0], "twitter": twitterLinks[0]}

    # print("for url = " + url)
    if len(facebookLinks) > 1 and len(twitterLinks) == 1:
        # print("    WARNING! more than one facebook link found")
        return {"facebook": ",".join(facebookLinks), "twitter": twitterLinks[0]}
    elif len(facebookLinks) == 1 and len(twitterLinks) > 1:
        # print("    WARNING! more than one twitter link found")
        return {"facebook": facebookLinks[0], "twitter": ",".join(twitterLinks)}
    elif len(facebookLinks) > 1 and len(twitterLinks) > 1:
        # print("    WARNING! more than one facebook and twitter link found")
        return {"facebook": ",".join(facebookLinks), "twitter": ",".join(twitterLinks)}
    elif len(soup.find_all(id = re.compile("captcha"))) > 0:
        return {"facebook": "captcha", "twitter": "captcha"}
    else:
        return {"facebook": "could not find", "twitter": "could not find"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide a URL of a website where you'd like me to find social media links")
        sys.exit(1)

    url = sys.argv[1]

    print(getLinks(url))
