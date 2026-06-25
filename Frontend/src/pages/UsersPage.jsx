import { useState } from "react";
import Layout from "../components/common/Layout.jsx";
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useCreateUserMutation,
} from "../features/users/userApi.js";

const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    department: "",
  });
  const { data, isLoading, refetch } = useGetUsersQuery({ page, limit: 10 });
  const [updateUser] = useUpdateUserMutation();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  const handleRoleChange = async (id, role) => {
    try {
      await updateUser({ id, role }).unwrap();
      refetch();
    } catch (error) {
      alert(error?.data?.message || "Failed to update user");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createUser(form).unwrap();
      setForm({
        name: "",
        email: "",
        password: "",
        role: "employee",
        department: "",
      });
      setShowForm(false);
      refetch();
    } catch (error) {
      alert(error?.data?.message || "Failed to create user");
    }
  };

  if (isLoading) {
    return (
      <Layout title="Users">
        <p>Loading users...</p>
      </Layout>
    );
  }

  const users = data?.data || [];

  return (
    <Layout title="Users">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            User Management
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            {showForm ? "Cancel" : "Add User"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-6 p-4 border rounded-xl dark:border-slate-600 grid gap-3 md:grid-cols-2">
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="p-2 border rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="p-2 border rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="p-2 border rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600"
              required
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="p-2 border rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600">
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <input
              placeholder="Department"
              value={form.department}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
              className="p-2 border rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600 md:col-span-2"
            />
            <button
              type="submit"
              disabled={isCreating}
              className="md:col-span-2 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">
              {isCreating ? "Creating..." : "Create User"}
            </button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700">
                <th className="p-2 border dark:border-slate-600 text-left">Name</th>
                <th className="p-2 border dark:border-slate-600 text-left">Email</th>
                <th className="p-2 border dark:border-slate-600 text-left">Department</th>
                <th className="p-2 border dark:border-slate-600 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="p-2 border dark:border-slate-600 dark:text-white">
                    {user.name}
                  </td>
                  <td className="p-2 border dark:border-slate-600 dark:text-white">
                    {user.email}
                  </td>
                  <td className="p-2 border dark:border-slate-600 dark:text-white">
                    {user.department || "—"}
                  </td>
                  <td className="p-2 border dark:border-slate-600">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value)
                      }
                      className="p-1 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600">
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-center items-center gap-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-3 py-1 border rounded-lg disabled:opacity-50 dark:text-white">
            Prev
          </button>
          <span className="dark:text-white">
            Page {page} / {data?.pagination?.pages || 1}
          </span>
          <button
            onClick={() =>
              setPage(Math.min(data?.pagination?.pages || 1, page + 1))
            }
            disabled={page >= (data?.pagination?.pages || 1)}
            className="px-3 py-1 border rounded-lg disabled:opacity-50 dark:text-white">
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default UsersPage;
