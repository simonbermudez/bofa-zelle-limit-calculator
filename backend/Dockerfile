FROM python:3

RUN apt-get update -y
RUN apt-get install -y wget
RUN wget -O $HOME/geckodriver.tar.gz https://github.com/mozilla/geckodriver/releases/download/v0.23.0/geckodriver-v0.23.0-linux64.tar.gz
RUN tar xf $HOME/geckodriver.tar.gz -C $HOME
RUN cp $HOME/geckodriver /usr/local/bin/geckodriver
RUN chmod +x /usr/local/bin/geckodriver
RUN rm -f $HOME/geckodriver $HOME/geckodriver.tar.gz

# Install firefox
RUN apt-get install -y firefox-esr

# get project files
COPY . /app
WORKDIR /app

# Install dependencies
RUN pip install -r requirements.txt

# run command flask --app hello run
CMD ["flask", "run", "--host=0.0.0.0", "--port=5001"]

