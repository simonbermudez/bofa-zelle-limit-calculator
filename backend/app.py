from bofa_scraper import BofAScraper # Import the package
import pandas as pd 
from datetime import datetime
from dateutil import parser
import os

from dotenv import load_dotenv


from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello_world():
    # return json of bofa analytics
    return get_bofa_analytics()


load_dotenv()  # take environment variables from .env.



def get_bofa_analytics():
    scraper = BofAScraper(
        os.environ['BOFA_USERNAME'],
        os.environ['BOFA_PASSWORD'],
        timeout_duration=5, # Timeout to allow for page loads, defaults to 5s
        headless=True,		# Optional, defaults to True
        verbose=True,		# Optional, defaults to True
    )

    scraper.login() # Log in

    # Transaction data is not automatically populated
    accounts = scraper.get_accounts()

    (
        scraper.open_account(accounts[0])	# Start session
            .scrape_transactions()			# Scrape visible transactions
            .load_more_transactions()		# Load more transactions
            .scrape_transactions()			# Scrape new and re-scrape old transactions
            .load_more_transactions()		# Load more transactions
            .scrape_transactions()			# Scrape new and re-scrape old transactions
            .close()						# Close session
    )

    # Dictionary populated with transactions
    transactions = accounts[0].get_transactions()

    # Convert to pandas DataFrame
    df = pd.DataFrame([
        {
            'uuid': transaction.uuid,
            'amount': transaction.amount,
            'date': datetime.now() if transaction.date == 'Processing' else parser.parse(transaction.date),
            'desc': transaction.desc,
            'type': transaction.type
        } for transaction in transactions
    ])

    # filter transactions by description 
    zelle_payments = df[df['desc'].str.contains('Zelle payment to')]

    # filter out transactions that are more than 30 days
    zelle_payments = zelle_payments[zelle_payments['date'] > datetime.now() - pd.DateOffset(days=30)]

    # sum all zelle payments 
    total_zelle_payments = zelle_payments['amount'].sum()

    scraper.quit() # Close browser

    return {
        'total_zelle_payments': total_zelle_payments,
        'zelle_payments': zelle_payments.to_dict(orient='records'),
        'total_money_left_month': 20000 + total_zelle_payments
    }