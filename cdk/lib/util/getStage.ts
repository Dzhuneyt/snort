export default () => {
    const environmentName = process.env.STAGE;

    if (!environmentName) {
        throw new Error('STAGE environment variable parameter not present. Can not deploy');
    }
    return environmentName;
}