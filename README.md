<h3>SmartJob</h3>
        <h4>Here's how it works:</h4>
        <p>The main pieces of data are as follows:</p>
        <ul>
          <li>Customers</li>
          <li>Estimates</li>
          <li>Jobs</li>
          <li>Invoices</li>
          <li>Tasks</li>
          <li>Notes</li>
        </ul>
        <p>Before you can do anything, you need a customer. Once you have a customer, you can 
          create new estimates, jobs or invoices for them.
        </p>
        <p>Any estimate or job consists of contact information for the customer, 
          a description of the job, and a list 
          of tasks. Because tasks are treated as their own distinct models in the data, it's quite simple 
          to turn an estimate into a job, and a job into an invoice. For example, when creating a job, you have 
          the option of selecting from any estimates already associated with that customer (same goes for invoice/jobs).
        </p>
        <p>However, changing a task in a job won't change it in the estimate (same for invoices).</p>
        <p>The intended workflow is: </p>
        <ul>
          <li>You get a new lead, a new customer calls your shop or finds you at a jobsite. (Create customer)</li>
          <li>That new customer is looking for a quote on getting some work done. (Create estimate)</li>
          <li>The customer approves the quote, or makes some changes, and is ready to move forward (Create job)</li>
          <li>The job is complete, and you're ready to send an invoice to the customer (Create invoice)</li>
        </ul>
        <p>Feel free to create your own user, but please don't use any credentials that you use for 
          something else. The default login is:
        </p>
        <p class="credentials">Username: <span>"test"</span></p>
        <p class="credentials">Password: <span>"pw"</span></p>
        <p>Note: This page is open to the public, so it's possible that some unscrupulous
          users may have added some ... questionable content to the default account. The database gets reset every day, though.
        </p>
        <div class="modal-button">
          <a href="http://crm.jonlwhittaker.com" target="_blank">Try it out</a>
        </div>
        
<h3>Running it yourself</h3>
<p>This project is run via two Docker containers, one for the actual Django app, and one for Nginx. The building of the containers is handled by the docker-compose file. To run it yourself, use <code>docker-compose</code> from the same directory as the compose file:</p>
<code>docker-compose build && docker-compose up</code><br/><br/>
<p>This starts the app at port 8080. To change the port, edit the gunicorn command in the docker-compose file.</p>
<p>If any changes are made in the static files of the app, you need to run:</p>
<code>python manage.py --collect-static</code><br/><br/>
<p>This will put all the static files in the directory for the Nginx container.</p>
