/* eslint-disable */
require('dotenv').config()

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');

const app = express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.urlencoded({ extended: true }));

const createTcpPool = require('./connect_db');
const createUnixPool = require('./connect_db_unix');

app.set('view engine', 'pug');
app.enable('trust proxy');
app.use(express.json());


app.listen(8080, () => {
    console.log(`Server listening on 8080`);
    createPoolAndEnsureSchema().then(() => console.log('connected to the database!'));
});

// reference: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/HEAD/cloud-sql/postgres/knex/index.js

// eslint-disable-next-line consistent-return
const ensureSchemaUsers = async pool => {
    const hasTableUsers = await pool.schema.hasTable('users');
    if (!hasTableUsers) {
        return pool.schema.createTable("users", table => {
            table.uuid('user_id').primary();
            table.string('user_firebase_id', 128);
            table.string('user_email', 128).unique();
            table.enum('user_role', ['normal', 'admin']).defaultTo('normal');
            table.enum('user_version', ['free', 'premium']).defaultTo('free');
            table.integer('user_storage_used').defaultTo(0);
        });
    }
};

const ensureSchemaFiles = async pool => {
    const hasTableFiles = await pool.schema.hasTable('files');
    if (!hasTableFiles) {
        return pool.schema.createTable("files", table => {
            table.string('file_id', 128).primary();
            table.string('file_name', 128).notNullable();
            table.integer('file_size').checkPositive();
            table.string('file_type', 128).notNullable();
            table.uuid('file_uploader').references('user_id').inTable('users');
            table.timestamp('file_upload_time');
            table.timestamp('file_last_download_time').defaultTo(null);
            table.integer('file_download_count').defaultTo(0);
            table.boolean('is_file_public');
            table.boolean('is_file_blocked').defaultTo(false);
        });
    }
}

const ensureSchemaFileTags = async pool => {
    const hasTableFileTags = await pool.schema.hasTable("file_tags");
    if (!hasTableFileTags) {
        return pool.schema.createTable("file_tags", table => {
            table.string('file_id', 128).references('files.file_id');
            table.string('file_tag');
            table.primary(['file_id', 'file_tag']);
        });
    }
}

const ensureSchemaFileSharedTo = async pool => {
    const hasTableFileSharedTo = await pool.schema.hasTable("file_shared_to");
    if (!hasTableFileSharedTo) {
        return pool.schema.createTable("file_shared_to", table => {
            table.string('user_email', 128);
            table.string('file_id', 128).references('files.file_id');
            table.primary(['user_email', 'file_id']);
        });
    }
}

const ensureSchemaRequests = async pool => {
    const hasTableRequests = await pool.schema.hasTable("requests");
    if (!hasTableRequests) {
        return pool.schema.createTable("requests", table => {
            table.uuid('request_id').primary();
            table.string('file_id', 128).references('files.file_id');
            table.string('file_name', 128).notNullable();
            table.text('request_reason').notNullable();
            table.timestamp('request_created_time').defaultTo(pool.fn.now());
            table.enum('request_status', ['pending', 'declined', 'accepted']).defaultTo('pending');
        });
    }
};

const createPoolAndEnsureSchema = async () =>
    createPool()
        .then(async pool => {
            // in case you need to drop the tables!
            // await pool.schema.dropTableIfExists("file_tags");
            // await pool.schema.dropTableIfExists("file_shared_to");
            // await pool.schema.dropTableIfExists("requests");
            // await pool.schema.dropTableIfExists("files");
            // await pool.schema.dropTableIfExists("tags");
            // await pool.schema.dropTableIfExists("users");

            await ensureSchemaUsers(pool);
            await ensureSchemaFiles(pool);
            await ensureSchemaFileTags(pool);
            await ensureSchemaFileSharedTo(pool);
            await ensureSchemaRequests(pool);
            await pool.raw(`UPDATE users SET user_version = 'free' WHERE user_email = 'calvin.liusnando@staffbase.com'`);
            return pool;
        })
        .catch(err => {
            throw err;
        });

const createPool = async () => {
    // Configure which instance and what database user to connect with.
    // Remember - storing secrets in plaintext is potentially unsafe. Consider using
    // something like https://cloud.google.com/kms/ to help keep secrets secret.
    const config = {pool: {}};

    // [START cloud_sql_postgres_knex_limit]
    // 'max' limits the total number of concurrent connections this pool will keep. Ideal
    // values for this setting are highly variable on app design, infrastructure, and database.
    config.pool.max = 5;

    // 'min' is the minimum number of idle connections Knex maintains in the pool.
    // Additional connections will be established to meet this value unless the pool is full.
    config.pool.min = 5;
    // [END cloud_sql_postgres_knex_limit]

    // [START cloud_sql_postgres_knex_timeout]
    // 'acquireTimeoutMillis' is the number of milliseconds before a timeout occurs when acquiring a
    // connection from the pool. This is slightly different from connectionTimeout, because acquiring
    // a pool connection does not always involve making a new connection, and may include multiple retries.
    // when making a connection
    config.pool.acquireTimeoutMillis = 60000; // 60 seconds
    // 'createTimeoutMillis` is the maximum number of milliseconds to wait trying to establish an
    // initial connection before retrying.
    // After acquireTimeoutMillis has passed, a timeout exception will be thrown.
    config.pool.createTimeoutMillis = 30000; // 30 seconds
    // 'idleTimeoutMillis' is the number of milliseconds a connection must sit idle in the pool
    // and not be checked out before it is automatically closed.
    config.pool.idleTimeoutMillis = 5000; // 5 seconds
    // [END cloud_sql_postgres_knex_timeout]

    // [START cloud_sql_postgres_knex_backoff]
    // 'knex' uses a built-in retry strategy which does not implement backoff.
    // 'createRetryIntervalMillis' is how long to idle after failed connection creation before trying again
    config.pool.createRetryIntervalMillis = 2000; // 2 seconds
    // [END cloud_sql_postgres_knex_backoff]
    return createTcpPool(config);
    //return createUnixPool(config);
}

let pool;

// eslint-disable-next-line consistent-return
app.use(async (req, res, next) => {
    if (pool) {
        return next();
    }
    try {
        pool = await createPoolAndEnsureSchema();
        next();
    } catch (err) {
        pool.destroy();
        return next(err);
    }
});

// functions

const {
    retrieveUserMetadata,
    retrieveAllUsersMetadata,
    createUserIfNotExistsAndRetrieveMetadata,
    deleteUserMetadata,
    updateUserVersionToPremium,
    updateUserVersionToFree
} = require('./functions/users');

app.get('/retrieve_user_metadata/:id', async (req, res) => {
    const userId = req.params.id;
    let response = await retrieveUserMetadata(pool, userId).catch(err => {
        return res.status(500).json({ message: `Internal server error!\n${err}` });
    });
    return res.status(200).json({message: `Metadata for the current user...`, response});
});

app.get('/retrieve_users_metadata', async (req, res) => {
    let response = await retrieveAllUsersMetadata(pool).catch(err => {
        return res.status(500).json({ message: `Internal server error!\n${err}` });
    });
    return res.status(200).json({message: `Metadata for all users!`, response: response});
})

app.post('/create_user_if_not_exists_and_retrieve_metadata', async (req, res) => {
    const { firebaseUserId, userEmail } = req.body;
    let response = await createUserIfNotExistsAndRetrieveMetadata(pool, firebaseUserId, userEmail).catch(err => {
        return res.status(500).json({ message: `Internal server error!\n${err}` });
    });
    return res.status(201).json({message: `OK!`, response: response});
});

app.delete('/delete_user_metadata/:id', async (req, res) => {
    const userId = req.params.id;
    await deleteUserMetadata(pool, userId).catch(err => {
        return res.status(500).json({ message: `Internal server error!\n${err}` });
    });
    return res.status(200).json({
        message: `metadata of user with ID ${userId} is deleted successfully!`,
    });
});

app.put('/update_user_version_premium/:id', async (req, res) => {
    const userId = req.params.id;
    await updateUserVersionToPremium(pool, userId).catch(err => {
        return res.status(500).json({ message: `Internal server error!\n${err}` });
    });
    return res.status(200).json({
        message: `user with ID ${userId} is set to premium user!`,
    });
});

app.put('/update_user_version_free/:id', async (req, res) => {
    const userId = req.params.id;
    await updateUserVersionToFree(pool, userId).catch(err => {
        return res.status(500).json({ message: `Internal server error!\n${err}` });
    });
    return res.status(200).json({
        message: `user with ID ${userId} is set to premium user!`,
    });
});

const {
    uploadFileMetadata,
    retrieveAllFilesMetadata,
    retrieveOwnedFilesMetadata,
    retrieveSharedFilesMetadata,
    updateFileMetadataAfterDownload,
    deleteFileMetadata,
    retrieveFileTags,
    updateFileTags,
    updateFileGeneralAccessLevel,
    retrieveFileSharedToEmails,
    updateFileSharedToEmails,
    deleteFileSharedToEmail,
    sendEmails
} = require('./functions/files');

app.post('/upload_file_metadata', async (req, res) => {
    await uploadFileMetadata(pool, req.body).catch(err => {
        return res.status(500).json({ message: `Internal server error!\n${err}` });
    });
    return res.status(201).json({message: 'success'});
});

app.get('/retrieve_all_files_metadata', async (req, res) => {
    let response = await retrieveAllFilesMetadata(pool).catch(err => {
        return res.status(500).json({ message: `Internal server error!\n${err}` });
    });
    return res.status(200).json({message: 'success', response });
});

app.get('/retrieve_shared_files_metadata/:id', async (req, res) => {
    const userId = req.params.id;
    let response = await retrieveSharedFilesMetadata(pool, userId).catch(err => {
        return res.status(500).json({ message: `Internal server error!\n${err}` });
    });
    return res.status(200).json({
        message: 'success',
        response: response?.rows ?? []
    });
});

app.get('/retrieve_owned_files_metadata/:id', async (req, res) => {
    const userId = req.params.id;
    let response = await retrieveOwnedFilesMetadata(pool, userId).catch(err => {
        return res.status(500).json({ message: `Internal server error!\n${err}` });
    });
    return res.status(200).json({
        message: 'success',
        response
    });
});

app.put('/update_file_metadata_after_download/:id', async (req, res) => {
    const fileId = req.params.id;
    await updateFileMetadataAfterDownload(pool, fileId).catch(err => {
        return res.status(500).json({ message: `Internal server error!\n${err}` });
    });
    return res.status(200).json({
        message: 'success'
    });
});

app.delete('/delete_file_metadata/:id', async (req, res) => {
    const fileId = req.params.id;
    await deleteFileMetadata(pool, fileId).catch(err => {
        return res.status(500).json({message: `Internal server error!\n${err}`});
    });
    return res.status(200).json({
        message: 'success'
    });
});

app.get('/get_file_tags/:id', async (req, res) => {
    const fileId = req.params.id;
    let response = await retrieveFileTags(pool, fileId).catch(err => {
        return res.status(500).json({ message: `Internal server error!\n${err}` });
    });
    return res.status(200).json({
        message: 'success',
        response: response.rows ?? []
    });
});

app.put('/update_file_tags/:id', async (req, res) => {
    const fileId = req.params.id;
    const { fileTags } = req.body;
    await updateFileTags(pool, fileId, fileTags).catch(err => {
        return res.status(500).json({ message: `Internal server error!\n${err}` });
    });
    return res.status(200).json({
        message: 'success'
    });
});

app.put('/update_file_general_access/:id', async (req, res) => {
   const fileId = req.params.id;
   const { isFilePublic } = req.body;
   await updateFileGeneralAccessLevel(pool, fileId, isFilePublic).catch(err => {
      return res.status(500).json({message: `Internal server error!\n${err}`});
   });
   return res.status(200).json({
       message: 'success'
   });
});

app.get('/retrieve_emails_file_shared_to/:id', async (req, res) => {
    const fileId = req.params.id;
    let response = await retrieveFileSharedToEmails(pool, fileId).catch(err => {
       return res.status(500).json({message: `Internal server error!\n${err}`});
    });

    return res.status(200).json({
       message: 'success',
       response: response.rows ?? []
    });
});

app.put('/update_emails_file_shared_to/:id', async (req, res) => {
   const fileId = req.params.id;
   const { userEmail, emails } = req.body;

    await updateFileSharedToEmails(pool, fileId, emails).catch(err => {
        return res.status(500).json({message: `Internal server error!\n${err}`});
    });

    for (let email of emails){
        await sendEmails(userEmail, email.user_email, fileId);
    }

    return res.status(200).json({
        message: 'success'
    });
});

app.delete('/delete_email_file_shared_to/:id', async (req, res) => {
    const fileId = req.params.id;
    const { email } = req.body;
    await deleteFileSharedToEmail(pool, fileId, email).catch(err => {
        return res.status(500).json({message: `Internal server error!\n${err}`});
    });

    return res.status(200).json({
        message: `file access revoked for ${email}!`
    })
})

// ------------------------------------ Stripe ----------------------------------------

const YOUR_DOMAIN = 'http://localhost:3000/dashboard/payment';

app.post('/create-checkout-session', async (req, res) => {
    // const customer = await stripe.customers.create({
    //     email: req.body.customer_email,
    //     description:'New Stripe Customer',
    //     metadata: { customerFirebaseId: req.body.customer_firebaseId, customerId: req.body.customer_id },
    //   });

    const prices = await stripe.prices.list({
        lookup_keys: [req.body.lookup_key],
        expand: ['data.product'],
    });

    const session = await stripe.checkout.sessions.create({
        metadata: {
            customerEmail:req.body.customer_email,
            customerFirebaseId: req.body.customer_firebaseId,
            customerId: req.body.customer_id,
        },
        billing_address_collection: 'auto',
        line_items: [
            {
                price: prices.data[0].id,
                // For metered billing, do not pass quantity
                quantity: 1
            },
        ],
        mode: 'subscription',
        success_url: `${YOUR_DOMAIN}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${YOUR_DOMAIN}?canceled=true`,
    });
    // console.log('session>>>>>>>>>>', session);
    // console.log('final res after payment>>>>>>>>>>', res);
    res.redirect(303, session.url);
});

app.post('/create-portal-session', async (req, res) => {
    // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
    // typically this is stored alongside the authenticated user in your database.
    const { session_id } = req.body;

    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
    // console.log('checkoutSession>>>>>>>>>>', checkoutSession);
    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    const returnUrl = YOUR_DOMAIN;
  
    const portalSession = await stripe.billingPortal.sessions.create({
    //  customer: checkoutSession.customer,
        customer: checkoutSession.customer,
        return_url: returnUrl,
    });
    res.redirect(303, portalSession.url);
  });

app.post('/webhook', express.raw({ type: 'application/json' }), (request, response) => {
      let event = request.body;
      // Replace this endpoint secret with your endpoint's unique secret
      // If you are testing with the CLI, find the secret by running 'stripe listen'
      // If you are using an endpoint defined with the API or dashboard, look in your webhook settings
      // at https://dashboard.stripe.com/webhooks
      const endpointSecret =process.env.STRIPE_WEBHOOK_SECRET;
      // Only verify the event if you have an endpoint secret defined.
      // Otherwise use the basic event deserialized with JSON.parse
      if (endpointSecret) {
        // Get the signature sent by Stripe
        const signature = request.headers['stripe-signature'];
        try {
          event = stripe.webhooks.constructEvent(
            request.body,
            signature,
            endpointSecret
          );
        } catch (err) {
          console.log(`⚠️  Webhook signature verification failed.`, err.message);
          return response.sendStatus(400);
        }
      }
      let subscription;
      let status;
      console.log(`🔔  Webhook received! Type: ${event}`);
      // Handle the event
      switch (event.type) {
        case 'customer.subscription.trial_will_end':
          subscription = event.data.object;
          status = subscription.status;
          console.log(`Subscription status is ${status}.`);
          // Then define and call a method to handle the subscription trial ending.
          // handleSubscriptionTrialEnding(subscription);
          break;
        case 'customer.subscription.deleted':
          subscription = event.data.object;
          status = subscription.status;
          console.log(`Subscription status is ${status}.`);
          // Then define and call a method to handle the subscription deleted.
          // handleSubscriptionDeleted(subscriptionDeleted);
          break;
        case 'customer.subscription.created':
          subscription = event.data.object;
          status = subscription.status;
          console.log(`Subscription status is ${status}.`);
          // Then define and call a method to handle the subscription created.
          // handleSubscriptionCreated(subscription);
          break;
        case 'customer.subscription.updated':
          subscription = event.data.object;
          status = subscription.status;
          console.log(`Subscription status is ${status}.`);
          // Then define and call a method to handle the subscription update.
          // handleSubscriptionUpdated(subscription);
          break;
        default:
          // Unexpected event type
          console.log(`Unhandled event type ${event.type}.`);
      }
      // Return a 200 response to acknowledge receipt of the event
      console.log(`🔔  Webhook processed!!!!!!!!!!!!!!!`,response);
      response.send();
});