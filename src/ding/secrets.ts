let dingtalkOutGoingToken = '';
try {
  dingtalkOutGoingToken = DINGTALK_OUTGOING_TOKEN;
} catch (error) {
  console.error(error);
}

export default {
  dingtalkOutGoingToken,
};
