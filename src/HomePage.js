import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  Button,
  Switch,
  FlatList,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import PaytmCustomuisdk, {
  PaytmConsentCheckBox,
} from 'paytm-customuisdk-react-native';

export default function HomePage({ navigation }) {
  const [mid, setMid] = useState('');
  const [clientId, setClientId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [isStaging, setIsStaging] = useState(false);
  const [txnToken, setTxnToken] = useState('');
  const [result, setResult] = useState('');
  const [authCheck, setAuthCheck] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [isTransactionStarted, setTransactionStarted] = useState(false);
  const [paymentFlow, setPaymentFlow] = useState('NONE');

  const paymentFLowList = ['NONE', 'ADDANDPAY', 'HYBRID'];

  const fetchPayOption = () =>
    new Promise(function(resolve, reject){
      var urls = '';
      if (isStaging) {
        urls = '';
      } else {
        urls = '';
      }
     
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '',
      };

      fetch(urls, requestOptions)
        .then((response) => {
          response
            .json()
            .then((res) => {
              var body = res.body;
              var resultInfo = body.resultInfo;
              if (resultInfo.resultStatus === 'S') {
                return resolve(body);
              } else {
                return reject(resultInfo.resultMsg);
              }
            })
            .catch((err) => {
              return reject(err.message);
            });
        })
        .catch((err) => {
          return reject(err.message);
        });
    });

  const startTransaction = async () => {
    setResult('');
        fetchPayOption()
          .then((body) => {
            // var paymentFlow = body.paymentFlow;
            var merchantPayOption = body.merchantPayOption;
            var savedInstruments = merchantPayOption.savedInstruments;
            var upiProfile = merchantPayOption.upiProfile;
            var vpaDetails = [];
            var bankAccounts = [];
            var paytmWalletBalance = '';
            if (
              upiProfile != undefined &&
              upiProfile.respDetails != undefined &&
              // upiProfile.upiOnboarding === true &&
              upiProfile.respDetails.profileDetail != undefined
            ) {
              vpaDetails = upiProfile.respDetails.profileDetail.vpaDetails;
              bankAccounts = upiProfile.respDetails.profileDetail.bankAccounts;
            }
            if (
              merchantPayOption.paymentModes[0].payChannelOptions[0]
                .balanceInfo != undefined
            ) {
              paytmWalletBalance =
                merchantPayOption.paymentModes[0].payChannelOptions[0]
                  .balanceInfo.accountBalance.value;
            }
            var merchantDetails = body.merchantDetails;
            initPaytmSdk(txnToken);
            navigation.navigate('PayMode', {
              paymentFlow: paymentFlow,
              savedInstruments: savedInstruments,
              vpaDetails: vpaDetails,
              bankAccounts: bankAccounts,
              paytmWalletBalance: paytmWalletBalance,
              merchantDetails: merchantDetails,
              mid: mid,
              orderId: orderId,
              txnToken: txnToken,
            });
            setTransactionStarted(false);
          })
          .catch((err) => {
            setTransactionStarted(false);
            setResult(err);
          });
  };

  const initPaytmSdk = (txnToken) => {
    PaytmCustomuisdk.initPaytmSDK(
      mid,
      orderId,
      txnToken,
      amount,
      isStaging,
      ''
    );
  };

  const fetchAuthCode = () => {
    if (authCheck === true) {
      PaytmCustomuisdk.fetchAuthCode(clientId, mid)
        .then((res) => {
          setResult(JSON.stringify(res));
          setAuthCode(res.response);
        })
        .catch((err) => {
          setResult(err.message);
        });
    } else {
      setResult('Please check auth code checkbox');
    }
  };

  const checkAuthCodeValid = () => {
    if (clientId === '' || authCode === '') {
      setResult('client id or auth code is empty');
      return;
    }
    PaytmCustomuisdk.isAuthCodeValid(clientId, authCode)
      .then((res) => {
        setResult(JSON.stringify(res));
      })
      .catch((err) => {
        setResult(err.message);
      });
  };

  const checkHasInstrument = () => {
    if (mid === '') {
      setResult('mid id is empty');
      return;
    }
    PaytmCustomuisdk.checkHasInstrument(mid)
      .then((res) => {
        setResult(JSON.stringify(res));
      })
      .catch((err) => {
        setResult(err.message);
      });
  };

  const isPaytmInstalled = () => {
    PaytmCustomuisdk.isPaytmAppInstalled()
      .then((res) => {
        setResult(JSON.stringify(res));
      })
      .catch((err) => {
        setResult(err.message);
      });
  };
  const { width } = Dimensions.get('window');
  const itemWidth = (width - 34) / 3;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View>
          <View style={{ margin: 8 }}>
            <View>
              <TextInput
                style={styles.textInput}
                defaultValue={mid}
                placeholder={'Merchant Id'}
                onChangeText={(e) => setMid(e)}
              />
              <TextInput
                style={styles.textInput}
                defaultValue={orderId}
                placeholder={'Order Id'}
                onChangeText={(e) => setOrderId(e)}
              />
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                defaultValue={amount}
                placeholder={'Amount'}
                onChangeText={(e) => setAmount(e)}
              />
              <TextInput
                style={styles.textInput}
                defaultValue={txnToken}
                placeholder={'Transaction token'}
                onChangeText={(e) => setTxnToken(e)}
              />
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 0.15 }}>
                  <Switch
                    value={isStaging}
                    onValueChange={() =>
                      isStaging ? setIsStaging(false) : setIsStaging(true)
                    }
                  />
                </View>
                <View style={{ flex: 0.85 }}>
                  <Text style={{ fontSize: 18 }}>
                    Staging : {isStaging ? 'true' : 'false'}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  borderColor: 'lightskyblue',
                  borderWidth: 1,
                  marginStart: 8,
                  marginTop: 16,
                  marginEnd: 8,
                }}
              >
                <FlatList
                  horizontal={true}
                  data={paymentFLowList}
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(index) => index}
                  renderItem={({ item }) => (
                    <TouchableWithoutFeedback
                      onPress={() => setPaymentFlow(item)}
                    >
                      <View
                        style={{
                          flex: 1,
                          minWidth: itemWidth,
                          maxWidth: itemWidth,
                        }}
                      >
                        {item === paymentFlow && (
                          <View style={styles.selectedView}>
                            <Text style={styles.selectedHeaderText}>
                              {item}
                            </Text>
                          </View>
                        )}
                        {item != paymentFlow && (
                          <View style={styles.unselectedView}>
                            <Text style={styles.unSelectedHeaderText}>
                              {item}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                />
              </View>
              <View style={styles.buttonStyle}>
                <Button
                  disabled={isTransactionStarted}
                  title="Start Transaction"
                  onPress={() => startTransaction()}
                />
              </View>
            </View>
            <View style={{ padding: 8 }}>
              <View>
                <PaytmConsentCheckBox
                  onChange={(e) => setAuthCheck(e)}
                />
              </View>
              <TextInput
                style={styles.textInput}
                defaultValue={clientId}
                placeholder={'Client Id'}
                onChangeText={(e) => setClientId(e)}
              />
              <View style={{ margin: 16 }}>
                <Button title="Fetch" onPress={() => fetchAuthCode()} />
              </View>
            </View>
            <View>
              <Text style={styles.textStyle}>Message :</Text>
              <Text style={styles.messageText}>{result}</Text>
            </View>
            <View
              style={{
                marginTop: 16,
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <View style={{ flex: 0.5, margin: 8 }}>
                <Button
                  title="Is Paytm Installed"
                  onPress={() => isPaytmInstalled()}
                />
              </View>
              <View style={{ flex: 0.5, margin: 8 }}>
                <Button
                  title="Is authcode Valid"
                  onPress={() => checkAuthCodeValid()}
                />
              </View>
            </View>
            <View style={{ margin: 8 }}>
              <Button
                title="check has instrument"
                onPress={() => checkHasInstrument()}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    backgroundColor: '#2c86d4',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    padding: 8,
  },
  textStyle: {
    marginTop: 16,
    marginStart: 4,
    fontSize: 19,
    fontWeight: 'bold',
  },
  textInput: {
    fontSize: 18,
    padding: 8,
    borderColor: 'gray',
    marginStart: 8,
    marginEnd: 8,
    borderBottomWidth: 1,
  },
  buttonStyle: {
    padding: 8,
    margin: 8,
  },
  messageText: {
    fontSize: 18,
    padding: 8,
  },
  listView: {
    margin: 8,
  },
  listHeaderText: {
    padding: 8,
    fontWeight: 'bold',
    flex: 0.3,
    alignSelf: 'center',
  },
  selectedView: {
    backgroundColor: 'lightskyblue',
    borderColor: 'white',
  },
  selectedHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    padding: 8,
    alignSelf: 'center',
  },
  unSelectedHeaderText: {
    fontWeight: 'bold',
    color: 'black',
    padding: 8,
    alignSelf: 'center',
  },
  unselectedView: {
    backgroundColor: 'white',
  },
});