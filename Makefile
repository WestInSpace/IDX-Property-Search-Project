# Port configuration
BACKEND_PORT  := 5000
FRONTEND_PORT := 3000

.PHONY: install testFront testBack testAll start stop clearLogs

#Install project dependencies
install:
	@echo "Installing backend dependancies . . ."
	@cd ./backend && npm install
	@echo "Installing frontend dependancies . . ."
	@cd ./fronend && npm install

#run the unit tests for the frontend
testFront:
	@echo "Running frontend unit tests . . ."
	@cd ./frontend && npm run test -- --run

#run the unit tests for the backend
testBack:
	@echo "Running backend unit tests . . ."
	@cd ./backend && npm run test

#run unit tests for both backend and frontend
testAll:
	@echo "Running backend unit tests . . ."
	@cd ./backend && npm run test
	@echo "Running frontend unit tests . . ."
	@cd ./frontend && npm run test -- --run

#Start the database container, backend server, and frontend server.
start:
	@mkdir -p ./logs/
	@echo "Starting database container. . ."
	@cd ./backend && docker compose up -d
	@echo "Waiting for database container to stabilize . . ."
	@sleep 5
	@echo "Starting backend server . . ."
	@cd ./backend && nohup npm run dev < /dev/null >> ../logs/backend.log 2>&1 &
	@echo "Starting frontend server . . ."
	@cd ./frontend && nohup npm run dev < /dev/null >> ../logs/frontend.log 2>&1 &
	@echo "All services started, check logs for output."

#Stop the frontend server, backend server, and database container
stop:
	@echo "Stopping backend server on port $(BACKEND_PORT) . . ."
	@echo "[`date +'%Y-%m-%d %H:%M:%S'`] Stopping backend server..." >> ./logs/backend.log
	-@PID=$$(fuser $(BACKEND_PORT)/tcp 2>/dev/null | xargs); \
	if [ -n "$$PID" ]; then \
		PPID=$$(ps -o ppid= -p $$PID 2>/dev/null | xargs); \
		kill -15 $$PPID $$PID 2>/dev/null || true; \
		sleep 0.5; \
		kill -9 $$PPID $$PID 2>/dev/null || true; \
	fi
	-@fuser -k -n tcp $(BACKEND_PORT) >> ./logs/backend.log 2>&1 || true
	@echo "[`date +'%Y-%m-%d %H:%M:%S'`] Backend server stopped." >> ./logs/backend.log

	@echo "Stopping frontend server on port $(FRONTEND_PORT) . . ."
	@echo "[`date +'%Y-%m-%d %H:%M:%S'`] Stopping frontend server..." >> ./logs/frontend.log
	-@PID=$$(fuser $(FRONTEND_PORT)/tcp 2>/dev/null | xargs); \
	if [ -n "$$PID" ]; then \
		PPID=$$(ps -o ppid= -p $$PID 2>/dev/null | xargs); \
		kill -15 $$PPID $$PID 2>/dev/null || true; \
		sleep 0.5; \
		kill -9 $$PPID $$PID 2>/dev/null || true; \
	fi
	-@fuser -k -n tcp $(FRONTEND_PORT) >> ./logs/frontend.log 2>&1 || true
	@echo "[`date +'%Y-%m-%d %H:%M:%S'`] Frontend server stopped." >> ./logs/frontend.log

	@echo "Stopping database container . . ."
	@cd ./backend && docker compose down
	@echo "All services stopped."

#Delete the content of the log files without deleting the file
clearLogs:
	@echo "Clearing all log file contents"
	@echo "" > ./logs/frontend.log
	@echo "" > ./logs/backend.log

#Delete all the local log files
deleteLogs:
	@echo "Deleting all log files"
	@rm -f $(ROOT_DIR)/logs/frontend.log
	@rm -f $(ROOT_DIR)/logs/backend.log
