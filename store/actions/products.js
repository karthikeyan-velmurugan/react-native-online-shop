import * as Permissions from "expo-permissions";
import * as Notifications from "expo-notifications";

import Product from "../../models/product";

export const DELETE_PRODUCT = "DELETE_PRODUCT";
export const CREATE_PRODUCT = "CREATE_PRODUCT";
export const UPDATE_PRODUCT = "UPDATE_PRODUCT";
export const SET_PRODUCTS = "SET_PRODUCTS";

export const fetchProducts = () => {
  return async (dispatch, getState) => {
    try {
      const userId = getState().auth.userId;
      //any async code we can execute here
      const response = await fetch(
        "https://rn-online-shop-54ae7.firebaseio.com/products.json"
      );

      if (!response.ok) {
        throw new Error("Someting went wrong!");
      }
      const resData = await response.json();

      //console.log(resData);
      //convert response object to array.
      //Here output object ::
      //Object {
      // "-MBZMmN7j5hgc-Xnugsi": Object {
      //   "description": "Test Desc",
      //   "imageUrl": "https://ae01.alicdn.com/kf/HTB1B._VQFXXXXXzXFXXq6xXFXXXJ.jpg",
      //   "price": 40.41,
      //   "title": "A White Shirt",
      // },
      //}

      const loadedProducts = [];
      for (const key in resData) {
        loadedProducts.push(
          new Product(
            key,
            resData[key].ownerId,
            resData[key].ownerPushToken,
            resData[key].title,
            resData[key].imageUrl,
            resData[key].description,
            resData[key].price
          )
        );
      }

      dispatch({
        type: SET_PRODUCTS,
        products: loadedProducts,
        userProducts: loadedProducts.filter((prod) => prod.ownerId === userId),
      });
    } catch (err) {
      throw err;
    }
  };
};

export const deleteProduct = (productId) => {
  return async (dispatch, getState) => {
    const token = getState().auth.token;
    //any async code we can execute here
    const response = await fetch(
      `https://rn-online-shop-54ae7.firebaseio.com/products/${productId}.json?auth=${token}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Someting went wrong!");
    }
    dispatch({ type: DELETE_PRODUCT, pid: productId });
  };
};

export const createProduct = (title, description, imageUrl, price) => {
  return async (dispatch, getState) => {
    //any async code we can execute here
    let pushToken;
    let statusObj = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    if (statusObj.status !== "granted") {
      statusObj = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    }
    if (statusObj.status !== "granted") {
      pushToken = null;
    } else {
      pushToken = (await Notifications.getExpoPushTokenAsync()).data;
    }

    const token = getState().auth.token;
    const userId = getState().auth.userId;
    const response = await fetch(
      `https://rn-online-shop-54ae7.firebaseio.com/products.json?auth=${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
          price,
          ownerId: userId,
          ownerPushToken: pushToken,
        }),
      }
    );
    const resData = await response.json();
    // console.log(resData);

    dispatch({
      type: CREATE_PRODUCT,
      productData: {
        id: resData.name,
        title,
        description,
        imageUrl,
        price,
        ownerId: userId,
        pushToken: pushToken,
      },
    });
  };
};

export const updateProduct = (id, title, description, imageUrl) => {
  return async (dispatch, getState) => {
    const token = getState().auth.token;
    const response = await fetch(
      `https://rn-online-shop-54ae7.firebaseio.com/products/${id}.json?auth=${token}`,
      {
        //PUT-will override all the data/field
        //PATCh-will update the particular modified field.
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Someting went wrong!");
    }

    dispatch({
      type: UPDATE_PRODUCT,
      pid: id,
      productData: {
        title,
        description,
        imageUrl,
      },
    });
  };
};
