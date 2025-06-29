/*
  Warnings:

  - A unique constraint covering the columns `[emp_number]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Users_emp_number_key` ON `Users`(`emp_number`);
