var UserApi = require('../controller/user.controller');
var auth = require('../controller/auth.controller');
var express = require('express');
const router = express.Router();
// router.use('/', auth.checkToken, auth.isWeb3NodeConnected);
// router.param('id', SeaFoodContractApi.validation_req);

// router.get('/user/:id', SeaFoodContractApi.get_user);
// // router.post('/user',ContractApi.add_user)
router.use('/', auth.checkToken);
router.post('/', UserApi.getUser);
router.put('/', UserApi.updateUser);
// router.post('/entity', SeaFoodContractApi.add_entity);
// router.put('/entity', SeaFoodContractApi.update_entity);
// router.get('/entity', SeaFoodContractApi.getEntities);
// router.get('/entity/:id', SeaFoodContractApi.getEntityById);
// router.get('/entity/all/:id', SeaFoodContractApi.getEntityByAddress);
// router.get('/entities', SeaFoodContractApi.getAllEntities);
// router.post('/entity/transact', SeaFoodContractApi.transactEntities);

// // router.get('/state/sensors', StateContractApi.getAllSensors);
// // router.put('/state/sensor', StateContractApi.updateSensor);
// // router.get('/state/sensor/:id', StateContractApi.getSensorInfo);
// router.get('/state/telemetries/:id', StateContractApi.getSensorTelemetryDetails);
// router.get('/state/telemetry/:id', StateContractApi.getTelemetry);
// router.get('/state/transact/:id', StateContractApi.getStateInfo);
// // router.get('/state/transaction/history', SeaFoodContractApi.getTransactionsHistory);
// // router.post('/state/sensor/attach',StateContractApi.attachSensor);
module.exports = router;