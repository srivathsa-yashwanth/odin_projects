import { firebase, FieldValue } from "../lib/firebase";

const doesUsernameExists = async (username) => {
  const result = await firebase
    .firestore()
    .collection("users")
    .where("username", "==", username)
    .get();

  return result.docs.map((user) => user.data().length > 0);
};

const getUserByUsername = async (username) => {
  const result = await firebase
    .firestore()
    .collection("users")
    .where("username", "==", username)
    .get();

  return result.docs.map((item) => ({ ...item.data(), docId: item.id }));
};

// get user from the firestore where userId === userId(passed from auth)
const getUserByUserId = async (userId) => {
  const result = await firebase
    .firestore()
    .collection("users")
    .where("userId", "==", userId)
    .get();

  const user = result.docs.map((item) => ({ ...item.data(), docId: item.id }));
  return user;
};

const getSuggestedProfiles = async (userId, following) => {
  const result = await firebase.firestore().collection("users").limit(10).get();
  return result.docs
    .map((user) => ({ ...user.data(), docId: user.id }))
    .filter(
      (profile) =>
        profile.userId !== userId && !following.includes(profile.userId)
    );
};

const updateLoggedInUserFollowing = async (
  loggedInUserDocId,
  profileId,
  isFollowingProfile
) => {
  return firebase
    .firestore()
    .collection("users")
    .doc(loggedInUserDocId)
    .update({
      following: isFollowingProfile
        ? FieldValue.arrayRemove(profileId)
        : FieldValue.arrayUnion(profileId),
    });
};

const updateFollowedUserFollowers = async (
  suggestedDocId,
  userId,
  isFollowingProfile
) => {
  return firebase
    .firestore()
    .collection("users")
    .doc(suggestedDocId)
    .update({
      followers: isFollowingProfile
        ? FieldValue.arrayRemove(userId)
        : FieldValue.arrayUnion(userId),
    });
};

const getPhotos = async (userId, following) => {
  const result = await firebase
    .firestore()
    .collection("photos")
    .where("userId", "in", following)
    .get();

  const userFollowedPhotos = result.docs.map((photo) => ({
    ...photo.data(),
    docId: photo.id,
  }));

  const photosWithUserDetails = await Promise.all(
    userFollowedPhotos.map(async (photo) => {
      let userLikedPhoto = false;
      if (photo.likes.includes(userId)) userLikedPhoto = true;
      const user = await getUserByUserId(photo.userId);
      const { username } = user[0];
      return { username, ...photo, userLikedPhoto };
    })
  );
  return photosWithUserDetails;
};

const getUserPhotos = async (user) => {
  const result = await firebase
    .firestore()
    .collection("photos")
    .where("userId", "==", user.userId)
    .get();

  return result.docs.map((item) => ({
    ...item.data(),
    docId: item.id,
  }));
};

const isUserFollowingProfile = async (loggedInUserUsername, profileUserId) => {
  const result = await firebase
    .firestore()
    .collection("users")
    .where("username", "==", loggedInUserUsername)
    .where("following", "array-contains", profileUserId)
    .get();

  const [response = {}] = result.docs.map((item) => ({
    ...item.data(),
    docId: item.id,
  }));

  return response.userId ? true : false;
};

const toggleFollow = async (
  isFollowingProfile,
  activeUserDocId,
  profileDocId,
  profileUserId,
  followingUserId
) => {
  await updateLoggedInUserFollowing(
    activeUserDocId,
    profileUserId,
    isFollowingProfile
  );
  await updateFollowedUserFollowers(
    profileDocId,
    followingUserId,
    isFollowingProfile
  );
};

export {
  doesUsernameExists,
  getUserByUserId,
  getUserByUsername,
  getSuggestedProfiles,
  updateFollowedUserFollowers,
  updateLoggedInUserFollowing,
  getPhotos,
  getUserPhotos,
  isUserFollowingProfile,
  toggleFollow,
};
