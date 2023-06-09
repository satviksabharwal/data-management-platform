import React, { useState, useEffect,useContext } from 'react';
import { Card, Stack, Container, Typography } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { useSelector } from "react-redux";
import { CurrentUserMetadataContext } from "../App";
import { selectCurrentUser } from "../store/user/user.selector";
import { retrieveCurrentUserMetadata } from "../utils/utilFunctions";
import { updateUserVersionPremium, retrieveUserMetadata } from "../actions/users";

const ProductDisplay = ({user}) => {
  return (
      <>
          <Container>
                <ToastContainer />
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom> Premium plan </Typography>
                </Stack>
                <div style={{textAlign:'center'}}>
                    <Card>
                        <section>
                            <div className="product">
                                <div className="description">
                                    <h3>Annual subscription</h3>
                                    <h4>49.00 EUR / year for 100GB Storage</h4>
                                </div>
                            </div>
                            <form action="/create-checkout-session" method="POST">
                                {/* Add a hidden field with the lookup_key of your Price */}
                                <input type="hidden" name="lookup_key" value='dmsuite101' />

                                <input type="hidden" name="customer_email" value={user && user.userEmail}/>
                                <input type="hidden" name="customer_firebaseId" value={user && user.userFirebaseId} />
                                <input type="hidden" name="customer_id" value={user && user.userId} />
                                <button id="checkout-and-portal-button" type="submit"
                                style={{ backgroundColor: '#48B2E3',
                                         border:'none',
                                         borderRadius:'6px',
                                         color:'white',
                                         fontWeight: '700',
                                         lineHeight: '1.7142857142857142',
                                         fontSize: '0.875rem',
                                         textTransform: 'capitalize',
                                         fontFamily: 'sans-serif',
                                         minWidth: '64px',
                                         padding: '6px 16px',
                                         cursor: 'pointer',
                                         margin:'15px'
                                        }}>
                                  Subscribe
                                </button>
                            </form>
                        </section>
                    </Card>
                    <Typography style={{ fontSize: 14, color:"GrayText", marginTop: 10}}>
                        * You will be charged 49 EUR annually
                    </Typography>
                </div>
          </Container>
      </>
  )
}

const SuccessDisplay = ({ sessionId }) => {
  return (
    <>
    <div style={{textAlign:'center'}}>
    <Card>
    <section>
      <div className="product Box-root">
        <div className="description Box-root">
          <h3>Subscription to annual plan successful!</h3>
        </div>
      </div>
      <form action="/create-portal-session" method="POST">
        <input
          type="hidden"
          id="session-id"
          name="session_id"
          value={sessionId}
        />
        <button id="checkout-and-portal-button" type="submit"
            style={{
                backgroundColor: '#48B2E3',
                border:'none',
                borderRadius:'6px',
                color:'white',
                fontWeight: '700',
                lineHeight: '1.7142857142857142',
                fontSize: '0.875rem',
                textTransform: 'capitalize',
                fontFamily: 'sans-serif',
                minWidth: '64px',
                padding: '6px 16px',
                cursor: 'pointer',
                margin:'15px'
            }}>
            Manage your billing information
        </button>
      </form>
    </section>
    </Card>
    </div>
    </>

  );
};

const Message = ({ message }) => (
  <section>
    <p>{message}</p>
  </section>
);

export default function PaymentModule() {
    const currentUser = useSelector(selectCurrentUser);
    const { currentUserMetadata, setUserMetadata } = useContext(CurrentUserMetadataContext);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [sessionId, setSessionId] = useState('');

    useEffect(() => {
        if(!currentUserMetadata.userId) {
            retrieveCurrentUserMetadata(currentUser, currentUserMetadata, setUserMetadata).then(() => null);
        }
    }, [currentUser, currentUserMetadata])


    useEffect(() => {
        // Check to see if this is a redirect back from Checkout
        const query = new URLSearchParams(window.location.search);
        const updateUserVersion = async () => {
            if (currentUserMetadata.userId) {
                await updateUserVersionPremium(currentUserMetadata.userId);
                const res = await retrieveUserMetadata(currentUserMetadata.userId);
                if (res.response && res.response[0].user_version !== currentUserMetadata.userVersion) {
                    setUserMetadata(res.response[0]);
                }
            }
        }
        if (query.get('success')) {
            setSuccess(true);
            setSessionId(query.get('session_id'));
            updateUserVersion().then(() => null);
        }

        if (query.get('canceled')) {
            setSuccess(false);
            setMessage("Order canceled -- continue to shop around and checkout when you're ready.");
        }
    }, [sessionId, currentUserMetadata]);

    if (success && sessionId !== '' || currentUserMetadata.userVersion === 'premium') {
        return <SuccessDisplay sessionId={sessionId} />;
    }

    if (!success && message === '') {
      return (
          <ProductDisplay user={currentUserMetadata}/>
      );
    }
    if (message !== '') return <Message message={message} />;
}
