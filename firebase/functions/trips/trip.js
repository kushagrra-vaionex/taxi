const functions = require("firebase-functions");
const admin = require("firebase-admin");
// admin.initializeApp();
const firestore = admin.firestore();

const kDistanceRadiusForDispatchInMiles = 50;

/*
 ** Dispatch new trip drivers
 */
exports.dispatch = functions.firestore
  .document("taxi_trips/{tripID}")
  .onWrite((change, context) => {
    const orderData = change.after.data();
    if (!orderData) {
      console.log("No trip data");
      return;
    }

    if (orderData.status === "passenger_cancelled") {
      console.log("Order #" + change.after.ref.id + " was cancelled.");
      return null;
    }

    if (
      orderData.status === "awaiting_driver" ||
      orderData.status === "driver_rejected"
    ) {
      // we need to find an available driver
      console.log("Finding a driver for order #" + change.after.ref.id);

      const rejectedByDrivers = orderData.rejectedByDrivers
        ? orderData.rejectedByDrivers
        : [];

      // change.after.ref.set({ status: "Pending Driver" }, {merge: true})
      return firestore
        .collection("users")
        .where("role", "==", "driver")
        .where("isActive", "==", true)
        .where("carType", "==", orderData.carType)
        .get()
        .then((snapshot) => {
          var found = false;
          snapshot.forEach((doc) => {
            if (!found) {
              // We simply assign the first available driver who's within a reasonable distance from the passenger and who did not reject the order
              const driver = doc.data();
              console.log(driver);

              if (
                driver.location &&
                rejectedByDrivers.indexOf(driver.id) === -1 &&
                (driver.inProgressOrderID === undefined ||
                  driver.inProgressOrderID === null) &&
                (driver.orderRequestData === undefined ||
                  driver.orderRequestData === null)
              ) {
                const pickup = orderData.pickup;
                if (pickup) {
                  const distance = distanceRadius(
                    driver.location.latitude,
                    driver.location.longitude,
                    pickup.latitude,
                    pickup.longitude
                  );
                  console.log("Driver (" + driver.email + " Location: ");
                  console.log(driver.location);
                  console.log(
                    "pickup Location: lat " +
                      pickup.latitude +
                      " long" +
                      pickup.latitude
                  );
                  console.log(distance);
                  if (distance < kDistanceRadiusForDispatchInMiles) {
                    found = true;
                    // We send the order to the driver, by appending orderRequestData to the driver's user model in the users table
                    firestore.collection("users").doc(driver.id).update({
                      orderRequestData: orderData,
                    });
                    console.log(
                      "Order sent to driver #" +
                        driver.id +
                        " for order #" +
                        change.after.ref.id +
                        " with distance at " +
                        distance
                    );
                  }
                }
              }
            }
          });
          if (!found) {
            // We did not find an available driver
            console.log(
              "Could not find an available driver for order #" +
                change.after.ref.id
            );
            change.after.ref.set(
              { status: "no_driver_found" },
              { merge: true }
            );
          }
          return null;
        })
        .catch((error) => {
          console.log(error);
        });
    }

    return null;
  });

const distanceRadius = (lat1, lon1, lat2, lon2) => {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    return dist;
  }
};
