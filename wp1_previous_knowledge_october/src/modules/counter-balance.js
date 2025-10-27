export function getCondition() {
  console.log("getting pending conditions");
  let condition = jatos.batchSession.find("/pending/0");
  if (typeof condition === "undefined") {
    console.log("No condition");
  } else {
    jatos.batchSession
      .move("/pending/0", "/started/0")
      .then(() => {
        console.log("starting with condition " + condition);
      })
      .catch(() => {
        console.log("failed to start condition");
        setTimeout(() => getCondition(), 1);
        getCondition();
      });
  }

  return condition;
}

export function finishCondition(condition) {
  console.log("adding finished conditions");
  jatos.batchSession
    .add("/finished/-", condition)
    .then(() => {
      console.log("done");
    })
    .catch(() => {
      console.log("failed to finish condition");
      setTimeout(() => finishCondition(condition), 1);
    });
}
