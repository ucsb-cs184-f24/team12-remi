import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { auth } from "../../../../firebaseConfig"; // Adjust this path if necessary
import Component from "../profile";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../../../firebaseConfig", () => ({
  auth: { currentUser: { uid: "testUid" } },
}));

jest.mock("firebase/auth", () => ({
  signOut: jest.fn(() => Promise.resolve()),
}));

describe("SignOut Functionality", () => {
  let mockRouterPush: jest.Mock;

  beforeEach(() => {
    mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should sign the user out and navigate to the login screen", async () => {
    const { getByText, queryByText } = render(<Component />);

    // Wait for loading to finish
    await waitFor(() => expect(queryByText("Loading...")).toBeNull());

    // Simulate opening the menu and clicking 'Sign Out'
    fireEvent.press(getByText("Sign Out"));

    // Wait for signOut to complete and navigation to happen
    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith(auth);
      expect(mockRouterPush).toHaveBeenCalledWith("../../poo"); // Adjust path if needed
    });
  });
});
