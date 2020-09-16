exports.handler = async (event, context, ) => {
    event.response.autoConfirmUser = true;
    event.response.autoVerifyEmail = true;
    context.done(null, event);
};