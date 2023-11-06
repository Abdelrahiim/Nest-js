export type Payload = {
  sub: string | number;
  email: string;
};

export type PayLoadWithToken = {
  sub: string | number;
  email: string;
  refreshToken: string;
};
