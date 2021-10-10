import sys
import urllib.request
from bs4 import BeautifulSoup
import re

def getLinks(url):
    """
    Will scrape the given url, and return any social media links within
    """
    print("Fetching content from " + url)
    response = urllib.request.urlopen(url)
    print("...done fetching, parsing now...")
    with response as f:
        soup = BeautifulSoup(f, 'html.parser')
        
    facebookLinks = []
    for link in soup.find_all(href=re.compile("facebook")):
        href = link.get('href')
        if not href in facebookLinks:
            facebookLinks.append(href)

    twitterLinks = []
    for link in soup.find_all(href=re.compile("twitter")):
        href = link.get('href')
        if not href in twitterLinks:
            twitterLinks.append(href)

    if len(facebookLinks) == 1 and len(twitterLinks) == 1:
        return {"facebook": facebookLinks[0], "twitter": twitterLinks[0]}

    print("for url = " + url)
    if len(facebookLinks) > 1 and len(twitterLinks) == 1:
        print("    WARNING! more than one facebook link found")
        return {"facebook": ",".join(facebookLinks), "twitter": twitterLinks[0]}
    elif len(facebookLinks) == 1 and len(twitterLinks) > 1:
        print("    WARNING! more than one twitter link found")
        return {"facebook": facebookLinks[0], "twitter": ",".join(twitterLinks)}
    else:
        print("    WARNING! more than one facebook and twitter link found")
        return {"facebook": ",".join(facebookLinks[0]), "twitter": ",".join(twitterLinks)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide a URL of a website where you'd like me to find social media links")
        sys.exit(1)

    url = sys.argv[1]

    print(getLinks(url))
